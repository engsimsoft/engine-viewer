/**
 * Сканер файлов двигателей (.det, .pou, .prt)
 *
 * Основные функции:
 * - Сканирование директории для поиска файлов двигателей
 * - Получение метаданных файлов (размер, дата изменения)
 * - Парсинг .prt файлов для извлечения auto metadata
 * - Отслеживание изменений файлов (file watching)
 * - Фильтрация по расширениям файлов
 *
 * @module fileScanner
 */

import { readdir, stat, access } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { watch } from 'chokidar';
import { parseDetFile, getProjectSummary } from './fileParser.js';
import { PrtParser } from '../parsers/formats/prtParser.js';
import { updateAutoMetadata, getMetadata, getMetadataFilePath } from './metadataService.js';

/**
 * @typedef {Object} FileInfo
 * @property {string} name - Имя файла (без пути)
 * @property {string} path - Полный путь к файлу
 * @property {string} extension - Расширение файла (например, ".det")
 * @property {number} size - Размер файла в байтах
 * @property {Date} modifiedAt - Дата последнего изменения
 * @property {Date} createdAt - Дата создания файла
 */

/**
 * @typedef {Object} ProjectFileInfo
 * @property {string} id - Уникальный ID проекта (имя файла без расширения)
 * @property {string} fileName - Имя файла (с расширением)
 * @property {string} filePath - Полный путь к файлу
 * @property {number} fileSize - Размер файла в байтах
 * @property {string} modifiedAt - ISO строка даты изменения
 * @property {string} createdAt - ISO строка даты создания
 * @property {number} numCylinders - Количество цилиндров (из парсинга метаданных)
 * @property {string} engineType - Тип двигателя (из парсинга метаданных)
 * @property {number} calculationsCount - Количество расчетов в файле
 */

/**
 * Нормализация имени файла в ID (slug)
 *
 * Examples:
 * - "Vesta 1.6 IM.det" → "vesta-1-6-im"
 * - "BMW M42.det" → "bmw-m42"
 * - "TM Soft ShortCut.pou" → "tm-soft-shortcut"
 * - "4_Cyl_ITB.prt" → "4-cyl-itb"
 *
 * @param {string} filename - Имя файла
 * @returns {string} Нормализованный ID
 */
export function normalizeFilenameToId(filename) {
  return filename
    .replace(/\.(det|pou|prt)$/i, '')  // Remove .det, .pou, or .prt extension
    .toLowerCase()                      // Convert to lowercase
    .replace(/\s+/g, '-')               // Replace spaces with hyphens
    .replace(/_/g, '-')                 // Replace underscores with hyphens
    .replace(/[^a-z0-9-]/g, '');        // Remove special characters
}

/**
 * Получает информацию о файле
 *
 * @param {string} filePath - Полный путь к файлу
 * @returns {Promise<FileInfo>} - Информация о файле
 */
export async function getFileInfo(filePath) {
  const stats = await stat(filePath);

  return {
    name: basename(filePath),
    path: filePath,
    extension: extname(filePath),
    size: stats.size,
    modifiedAt: stats.mtime,
    createdAt: stats.birthtime
  };
}

/**
 * Проверяет, соответствует ли файл списку разрешённых расширений
 *
 * @param {string} fileName - Имя файла
 * @param {string[]} allowedExtensions - Массив разрешённых расширений (например, [".det"])
 * @returns {boolean} - true если файл подходит
 */
function isFileAllowed(fileName, allowedExtensions) {
  if (!allowedExtensions || allowedExtensions.length === 0) {
    return true; // Если нет ограничений, разрешаем все
  }

  const fileExt = extname(fileName).toLowerCase();
  return allowedExtensions.some(ext => ext.toLowerCase() === fileExt);
}

/**
 * Рекурсивно сканирует директорию и все подпапки
 * @param {string} directoryPath - Путь к директории
 * @param {string[]} extensions - Массив расширений файлов
 * @param {FileInfo[]} fileList - Аккумулятор для найденных файлов
 * @returns {Promise<FileInfo[]>} - Массив всех найденных файлов
 */
async function scanDirectoryRecursive(directoryPath, extensions, fileList = []) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      // Рекурсивно сканируем подпапки
      await scanDirectoryRecursive(fullPath, extensions, fileList);
    } else if (entry.isFile() && isFileAllowed(entry.name, extensions)) {
      // Добавляем файл в список
      const fileInfo = await getFileInfo(fullPath);
      fileList.push(fileInfo);
    }
  }

  return fileList;
}

/**
 * Сканирует директорию и возвращает список файлов с заданными расширениями
 * РЕКУРСИВНО сканирует все подпапки
 *
 * @param {string} directoryPath - Путь к директории для сканирования
 * @param {string[]} extensions - Массив расширений файлов (например, [".det", ".pou", ".prt"])
 * @returns {Promise<FileInfo[]>} - Массив информации о файлах
 *
 * @example
 * const files = await scanDirectory('./test-data', ['.det', '.pou', '.prt']);
 * console.log(`Найдено ${files.length} файлов`);
 */
export async function scanDirectory(directoryPath, extensions = ['.det', '.pou', '.prt']) {
  try {
    // Рекурсивное сканирование всех подпапок
    const files = await scanDirectoryRecursive(directoryPath, extensions);

    // Сортируем по дате изменения (новые сверху)
    files.sort((a, b) => b.modifiedAt - a.modifiedAt);

    return files;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Директория не найдена: ${directoryPath}`);
    }
    if (error.code === 'EACCES') {
      throw new Error(`Нет доступа к директории: ${directoryPath}`);
    }
    throw error;
  }
}

/**
 * Получает даты создания/модификации из .prt файла проекта
 *
 * .prt файл - главный файл проекта, создается ОДИН РАЗ при создании проекта.
 * birthtime .prt файла = истинная дата создания проекта
 * mtime .prt файла = дата последнего изменения конфигурации двигателя
 *
 * @param {string} detOrPouFilePath - Путь к .det или .pou файлу
 * @returns {Promise<{createdAt: Date, modifiedAt: Date}|null>} - Даты из .prt файла или null если не найден
 */
async function getPrtFileDates(detOrPouFilePath) {
  try {
    // Структура:
    // .prt файл: test-data/Vesta 1.6 IM.prt
    // .det/.pou: test-data/Vesta 1.6 IM/Vesta 1.6 IM.det

    const fileName = basename(detOrPouFilePath, extname(detOrPouFilePath)); // "Vesta 1.6 IM"
    const projectFolder = dirname(detOrPouFilePath); // "test-data/Vesta 1.6 IM"
    const dataFolder = dirname(projectFolder); // "test-data"

    // Путь к .prt файлу в корне data folder
    const prtFilePath = join(dataFolder, `${fileName}.prt`);

    // Проверяем существует ли .prt файл
    try {
      await access(prtFilePath);
    } catch {
      // .prt файл не найден
      return null;
    }

    // Получаем даты из .prt файла
    const prtStats = await stat(prtFilePath);

    // Проверка для старых проектов (скопированных/перемещенных):
    // Если birthtime > mtime, значит файл был скопирован, используем mtime как дату создания.
    // Для новых проектов (созданных после сегодняшнего дня) birthtime будет правильным.
    let createdAt = prtStats.birthtime;
    if (prtStats.birthtime > prtStats.mtime) {
      // Файл был скопирован - используем mtime как дату создания
      createdAt = prtStats.mtime;
      console.log(`[Scanner] 📅 Old project detected (copied file): ${basename(prtFilePath)} - using mtime as created date`);
    }

    return {
      createdAt: createdAt,
      modifiedAt: prtStats.mtime
    };
  } catch (error) {
    console.error(`[Scanner] ⚠️  Error reading .prt file dates:`, error.message);
    return null;
  }
}

/**
 * Проверяет нужно ли парсить .prt файл (cache validation)
 * Сравнивает modification time .prt файла с датой обновления metadata
 *
 * @param {string} prtPath - Путь к .prt файлу
 * @param {string} projectId - ID проекта (normalized filename)
 * @returns {Promise<boolean>} - true если нужно парсить, false если кэш актуален
 */
export async function shouldParsePrt(prtPath, projectId) {
  try {
    // Check if metadata exists
    const metadata = await getMetadata(projectId);

    if (!metadata) {
      console.log(`[Cache] Metadata missing for ${projectId} → parse`);
      return true; // Metadata doesn't exist → need to parse
    }

    // Check if auto metadata exists (critical: handles manual metadata creation)
    if (!metadata.auto) {
      console.log(`[Cache] Auto metadata missing for ${projectId} → parse`);
      return true; // Auto section missing → must parse .prt to populate it
    }

    // Compare modification times
    const prtStats = await stat(prtPath);
    const metadataDate = new Date(metadata.modified);

    if (prtStats.mtime > metadataDate) {
      console.log(`[Cache] PRT newer for ${projectId} (prt: ${prtStats.mtime.toISOString()}, metadata: ${metadata.modified}) → parse`);
      return true; // .prt file is newer → re-parse
    }

    console.log(`[Cache] Cache valid for ${projectId} (prt: ${prtStats.mtime.toISOString()}, metadata: ${metadata.modified}) → skip`);
    return false; // Cache is valid → skip parsing
  } catch (error) {
    console.error(`[Cache] Error checking ${projectId}:`, error.message);
    return true; // On error → parse to be safe
  }
}

/**
 * Парсит .prt файл и обновляет auto metadata
 * @param {FileInfo} file - Информация о файле
 * @returns {Promise<Object|null>} - Auto metadata или null если ошибка
 */
export async function parsePrtFileAndUpdateMetadata(file) {
  try {
    const prtParser = new PrtParser();
    const result = await prtParser.parse(file.path);

    // Извлекаем auto metadata из результата парсинга
    const autoMetadata = {
      cylinders: result.engine.cylinders,
      type: result.engine.type,
      configuration: result.engine.configuration,
      bore: result.engine.bore,
      stroke: result.engine.stroke,
      displacement: result.engine.displacement,
      compressionRatio: result.engine.compressionRatio,
      maxPowerRPM: result.engine.maxPowerRPM,
      intakeSystem: result.engine.intakeSystem,
      valvesPerCylinder: result.engine.valvesPerCylinder,
      inletValves: result.engine.inletValves,
      exhaustValves: result.engine.exhaustValves,
      combustion: result.combustion // v3.2.0: Ignition model data (fuel type, timing curves)
    };

    // Получаем projectId из имени файла
    const projectId = normalizeFilenameToId(file.name);

    // Обновляем auto metadata в .metadata/<projectId>.json
    await updateAutoMetadata(projectId, autoMetadata);

    console.log(`[Scanner] 🔧 Auto metadata updated: ${file.name} → .metadata/${projectId}.json`);

    return autoMetadata;
  } catch (error) {
    console.error(`[Scanner] ❌ Error parsing .prt file ${file.name}:`, error.message);
    return null;
  }
}

/**
 * @typedef {Object} ProjectError
 * @property {'missing_prt' | 'parsing_failed' | 'incomplete_metadata' | 'corrupted_files'} type
 * @property {'warning' | 'error' | 'critical'} severity
 * @property {string} message
 * @property {string} [details]
 * @property {string} timestamp
 */

/**
 * Detects errors in project data and metadata
 * @param {Object} project - Project object from scanProjects
 * @param {Object|null} metadata - Metadata object (auto/manual) or null
 * @param {string|null} prtFilePath - Path to .prt file or null if not exists
 * @returns {ProjectError[]} - Array of detected errors
 */
export function detectProjectErrors(project, metadata, prtFilePath) {
  const errors = [];
  const timestamp = new Date().toISOString();

  // Critical fields that must be present in auto metadata
  const criticalFields = ['cylinders', 'type', 'intakeSystem', 'valvesPerCylinder'];

  // 1. Check for missing .prt file (CRITICAL)
  if (!prtFilePath) {
    errors.push({
      type: 'missing_prt',
      severity: 'critical',
      message: 'No .prt file found - engine metadata cannot be auto-generated',
      details: 'Add a .prt file with the same name as the project to enable automatic metadata extraction',
      timestamp
    });
  }

  // 2. Check for parsing failure (ERROR)
  // If .prt file exists but metadata.auto is missing/null, parsing likely failed
  if (prtFilePath && (!metadata || !metadata.auto)) {
    errors.push({
      type: 'parsing_failed',
      severity: 'error',
      message: 'Failed to parse .prt file',
      details: '.prt file exists but parsing failed - check file format and integrity',
      timestamp
    });
  }

  // 3. Check for incomplete metadata (WARNING)
  if (metadata && metadata.auto) {
    const missingFields = criticalFields.filter(field => !metadata.auto[field]);

    if (missingFields.length > 0) {
      errors.push({
        type: 'incomplete_metadata',
        severity: 'warning',
        message: `Incomplete engine data: missing ${missingFields.join(', ')}`,
        details: `The .prt file is missing critical engine specifications. ${missingFields.length} field(s) need to be added.`,
        timestamp
      });
    }
  }

  // 4. Check for corrupted files (CRITICAL)
  if (project.error) {
    errors.push({
      type: 'corrupted_files',
      severity: 'critical',
      message: 'Project files cannot be read or parsed',
      details: project.error,
      timestamp
    });
  }

  return errors;
}

/**
 * Сканирует директорию и возвращает полную информацию о проектах (файлах + данные парсинга)
 *
 * @param {string} directoryPath - Путь к директории для сканирования
 * @param {string[]} extensions - Массив расширений файлов
 * @param {number} maxFileSize - Максимальный размер файла в байтах (0 = без ограничений)
 * @param {Object} [prtQueue] - Опциональная очередь для фонового парсинга .prt файлов
 * @returns {Promise<ProjectFileInfo[]>} - Массив информации о проектах
 *
 * @example
 * const projects = await scanProjects('./test-data', ['.det', '.pou', '.prt'], 10485760, prtQueue);
 * console.log(`Найдено ${projects.length} проектов`);
 */
export async function scanProjects(directoryPath, extensions = ['.det', '.pou', '.prt'], maxFileSize = 0, prtQueue = null) {
  const files = await scanDirectory(directoryPath, extensions);

  // Фильтруем файлы по размеру (если задано ограничение)
  const validFiles = maxFileSize > 0
    ? files.filter(file => file.size <= maxFileSize)
    : files;

  if (validFiles.length < files.length) {
    console.warn(`⚠️  Пропущено ${files.length - validFiles.length} файлов (превышен максимальный размер ${maxFileSize} байт)`);
  }

  // Парсим метаданные каждого файла
  const projectPromises = validFiles.map(async (file) => {
    try {
      // Если это .prt файл - проверяем кэш и добавляем в очередь если нужно
      if (file.name.endsWith('.prt')) {
        const projectId = normalizeFilenameToId(file.name);

        // Check cache validity
        const needsParsing = await shouldParsePrt(file.path, projectId);

        if (prtQueue && needsParsing) {
          // Add to background queue (low priority during startup)
          console.log(`[Scanner] Queuing for parsing: ${file.name}`);
          prtQueue.addToQueue(file, parsePrtFileAndUpdateMetadata, 'low');
        } else if (needsParsing) {
          // No queue provided → parse synchronously (old behavior for compatibility)
          console.log(`[Scanner] Processing .prt file: ${file.name}`);
          await parsePrtFileAndUpdateMetadata(file);
        }
        // else: cache is valid, skip parsing

        // Для .prt файлов не создаём проект (они только обновляют metadata)
        // Проект создаётся из .det/.pou файлов
        return null;
      }

      // Парсим .det/.pou файл для получения метаданных и расчетов
      const project = await parseDetFile(file.path);
      const summary = getProjectSummary(project);

      // Получаем даты из .prt файла проекта (если существует)
      // .prt файл - главный файл проекта, его birthtime = дата создания проекта
      const prtDates = await getPrtFileDates(file.path);

      // Используем даты из .prt файла если найден, иначе fallback на .det/.pou
      const createdAt = prtDates?.createdAt || file.createdAt;
      const modifiedAt = prtDates?.modifiedAt || file.modifiedAt;

      return {
        id: normalizeFilenameToId(file.name), // Normalized ID (slug)
        name: file.name.replace(/\.(det|pou)$/i, ''), // Display name (filename without extension)
        fileName: file.name,
        filePath: file.path,
        fileSize: file.size,
        modifiedAt: modifiedAt.toISOString(),
        createdAt: createdAt.toISOString(),
        format: summary.format,           // Формат файла ('det' или 'pou')
        numCylinders: summary.numCylinders,
        engineType: summary.engineType,
        calculationsCount: summary.calculationsCount
      };
    } catch (error) {
      console.error(`❌ Ошибка парсинга файла ${file.name}:`, error.message);

      // Для .prt файлов - пропускаем, не создаём проект
      if (file.name.endsWith('.prt')) {
        return null;
      }

      // Даже при ошибке парсинга пытаемся получить даты из .prt файла
      const prtDates = await getPrtFileDates(file.path);
      const createdAt = prtDates?.createdAt || file.createdAt;
      const modifiedAt = prtDates?.modifiedAt || file.modifiedAt;

      // Возвращаем базовую информацию даже если парсинг не удался
      return {
        id: normalizeFilenameToId(file.name), // Normalized ID (slug)
        name: file.name.replace(/\.(det|pou)$/i, ''), // Display name
        fileName: file.name,
        filePath: file.path,
        fileSize: file.size,
        modifiedAt: modifiedAt.toISOString(),
        createdAt: createdAt.toISOString(),
        format: file.name.endsWith('.pou') ? 'pou' : 'det', // Определяем по расширению
        numCylinders: 0,
        engineType: 'UNKNOWN',
        calculationsCount: 0,
        error: error.message
      };
    }
  });

  // Фильтруем null значения (.prt файлы)
  const projects = (await Promise.all(projectPromises)).filter(p => p !== null);

  // Дедупликация: если есть файлы .det и .pou с одинаковым base name,
  // оставляем только один проект
  // Приоритет: pou-merged (73 params) > pou (71 params) > det (24 params)
  const projectsMap = new Map();

  for (const project of projects) {
    const existing = projectsMap.get(project.id);

    if (!existing) {
      // Первый проект с таким ID
      projectsMap.set(project.id, project);
    } else {
      // Уже есть проект с таким ID - выбираем приоритетный формат

      // Определяем приоритет форматов
      const formatPriority = {
        'pou-merged': 3, // Highest priority (73 parameters)
        'pou': 2,        // Medium priority (71 parameters)
        'det': 1         // Lowest priority (24 parameters)
      };

      const existingPriority = formatPriority[existing.format] || 0;
      const projectPriority = formatPriority[project.format] || 0;

      if (projectPriority > existingPriority) {
        // Новый проект имеет более высокий приоритет - заменяем
        projectsMap.set(project.id, project);
        console.log(
          `[Scanner] Дедупликация: "${project.id}" - заменяем .${existing.format} на .${project.format} (приоритет: ${projectPriority} > ${existingPriority})`
        );
      } else if (projectPriority === existingPriority && project.format === 'pou-merged') {
        // Оба проекта pou-merged (идентичные merged результаты) - оставляем существующий
        console.log(
          `[Scanner] Дедупликация: "${project.id}" - оба проекта pou-merged (идентичные), оставляем существующий`
        );
      } else {
        // Существующий проект имеет более высокий или равный приоритет - пропускаем новый
        console.log(
          `[Scanner] Дедупликация: "${project.id}" - уже есть .${existing.format} (приоритет: ${existingPriority}), пропускаем .${project.format} (приоритет: ${projectPriority})`
        );
      }
    }
  }

  return Array.from(projectsMap.values());
}

/**
 * @typedef {Object} WatcherCallbacks
 * @property {(filePath: string) => void} onAdd - Вызывается при добавлении файла
 * @property {(filePath: string) => void} onChange - Вызывается при изменении файла
 * @property {(filePath: string) => void} onRemove - Вызывается при удалении файла
 * @property {(error: Error) => void} onError - Вызывается при ошибке
 */

/**
 * @typedef {Object} FileWatcher
 * @property {() => Promise<void>} close - Остановить отслеживание файлов
 * @property {() => string[]} getWatchedFiles - Получить список отслеживаемых файлов
 */

/**
 * Создаёт watcher для отслеживания изменений файлов в директории
 *
 * @param {string} directoryPath - Путь к директории для отслеживания
 * @param {string[]} extensions - Массив расширений файлов для отслеживания
 * @param {WatcherCallbacks} callbacks - Колбэки для обработки событий
 * @returns {FileWatcher} - Объект watcher с методами управления
 *
 * @example
 * const watcher = createFileWatcher('./test-data', ['.det', '.pou', '.prt'], {
 *   onAdd: (path) => console.log(`Добавлен файл: ${path}`),
 *   onChange: (path) => console.log(`Изменён файл: ${path}`),
 *   onRemove: (path) => console.log(`Удалён файл: ${path}`),
 *   onError: (error) => console.error('Ошибка:', error)
 * });
 *
 * // Остановить отслеживание
 * await watcher.close();
 */
export function createFileWatcher(directoryPath, extensions = ['.det', '.pou', '.prt'], callbacks = {}) {
  const {
    onAdd = () => {},
    onChange = () => {},
    onRemove = () => {},
    onError = () => {}
  } = callbacks;

  // Создаём pattern для chokidar на основе расширений
  // Например: './test-data/**/*.det'
  const patterns = extensions.map(ext => join(directoryPath, '**', `*${ext}`));

  // Настройки chokidar
  const watcherOptions = {
    persistent: true,       // Не останавливать процесс
    ignoreInitial: true,    // НЕ триггерить 'add' для существующих файлов (только для новых)
    awaitWriteFinish: {     // Ждать завершения записи файла
      stabilityThreshold: 500,  // Миллисекунды стабильности размера файла
      pollInterval: 100         // Интервал проверки
    }
  };

  // Создаём watcher
  const watcher = watch(patterns, watcherOptions);

  // События
  watcher
    .on('add', (filePath) => {
      console.log(`📄 Обнаружен новый файл: ${basename(filePath)}`);
      onAdd(filePath);
    })
    .on('change', (filePath) => {
      console.log(`📝 Файл изменён: ${basename(filePath)}`);
      onChange(filePath);
    })
    .on('unlink', (filePath) => {
      console.log(`🗑️  Файл удалён: ${basename(filePath)}`);
      onRemove(filePath);
    })
    .on('error', (error) => {
      console.error('❌ Ошибка file watcher:', error);
      onError(error);
    })
    .on('ready', () => {
      const watchedPaths = watcher.getWatched();
      const fileCount = Object.values(watchedPaths)
        .reduce((sum, files) => sum + files.length, 0);
      console.log(`👀 File watcher запущен (отслеживается ${fileCount} файлов)`);
    });

  // Возвращаем объект с методами управления
  return {
    /**
     * Остановить отслеживание файлов
     */
    close: async () => {
      await watcher.close();
      console.log('🛑 File watcher остановлен');
    },

    /**
     * Получить список отслеживаемых файлов
     * @returns {string[]} - Массив путей к файлам
     */
    getWatchedFiles: () => {
      const watched = watcher.getWatched();
      const files = [];

      for (const [dir, fileNames] of Object.entries(watched)) {
        fileNames.forEach(fileName => {
          files.push(join(dir, fileName));
        });
      }

      return files;
    }
  };
}

/**
 * Форматирует размер файла в человеко-читаемый формат
 *
 * @param {number} bytes - Размер в байтах
 * @returns {string} - Отформатированная строка (например, "1.5 MB")
 *
 * @example
 * formatFileSize(1024);        // "1.0 KB"
 * formatFileSize(1536);        // "1.5 KB"
 * formatFileSize(1048576);     // "1.0 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Получает краткую статистику по директории с файлами двигателей
 *
 * @param {string} directoryPath - Путь к директории
 * @param {string[]} extensions - Массив расширений файлов
 * @returns {Promise<Object>} - Статистика директории
 *
 * @example
 * const stats = await getDirectoryStats('./test-data', ['.det', '.pou', '.prt']);
 * console.log(`Найдено ${stats.filesCount} файлов, общий размер: ${stats.totalSizeFormatted}`);
 */
export async function getDirectoryStats(directoryPath, extensions = ['.det', '.pou', '.prt']) {
  try {
    const files = await scanDirectory(directoryPath, extensions);

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const oldestFile = files.length > 0
      ? files.reduce((oldest, file) => file.createdAt < oldest.createdAt ? file : oldest)
      : null;
    const newestFile = files.length > 0
      ? files.reduce((newest, file) => file.modifiedAt > newest.modifiedAt ? file : newest)
      : null;

    return {
      directoryPath,
      filesCount: files.length,
      totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      oldestFile: oldestFile ? {
        name: oldestFile.name,
        createdAt: oldestFile.createdAt.toISOString()
      } : null,
      newestFile: newestFile ? {
        name: newestFile.name,
        modifiedAt: newestFile.modifiedAt.toISOString()
      } : null
    };
  } catch (error) {
    throw new Error(`Не удалось получить статистику директории: ${error.message}`);
  }
}
