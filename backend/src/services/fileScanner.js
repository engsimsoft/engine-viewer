/**
 * Сканер файлов двигателей (.det, .pou)
 *
 * Основные функции:
 * - Сканирование директории для поиска файлов двигателей
 * - Получение метаданных файлов (размер, дата изменения)
 * - Отслеживание изменений файлов (file watching)
 * - Фильтрация по расширениям файлов
 *
 * @module fileScanner
 */

import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { watch } from 'chokidar';
import { parseDetFile, getProjectSummary } from './fileParser.js';

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
 *
 * @param {string} filename - Имя файла
 * @returns {string} Нормализованный ID
 */
export function normalizeFilenameToId(filename) {
  return filename
    .replace(/\.(det|pou)$/i, '')  // Remove .det or .pou extension
    .toLowerCase()                  // Convert to lowercase
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '');    // Remove special characters
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
 * Сканирует директорию и возвращает список файлов с заданными расширениями
 *
 * @param {string} directoryPath - Путь к директории для сканирования
 * @param {string[]} extensions - Массив расширений файлов (например, [".det", ".pou"])
 * @returns {Promise<FileInfo[]>} - Массив информации о файлах
 *
 * @example
 * const files = await scanDirectory('./test-data', ['.det', '.pou']);
 * console.log(`Найдено ${files.length} файлов`);
 */
export async function scanDirectory(directoryPath, extensions = ['.det', '.pou']) {
  try {
    // Читаем содержимое директории
    const entries = await readdir(directoryPath, { withFileTypes: true });

    // Фильтруем только файлы (не директории) с нужными расширениями
    const filePromises = entries
      .filter(entry => entry.isFile())
      .filter(entry => isFileAllowed(entry.name, extensions))
      .map(entry => getFileInfo(join(directoryPath, entry.name)));

    const files = await Promise.all(filePromises);

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
 * Сканирует директорию и возвращает полную информацию о проектах (файлах + данные парсинга)
 *
 * @param {string} directoryPath - Путь к директории для сканирования
 * @param {string[]} extensions - Массив расширений файлов
 * @param {number} maxFileSize - Максимальный размер файла в байтах (0 = без ограничений)
 * @returns {Promise<ProjectFileInfo[]>} - Массив информации о проектах
 *
 * @example
 * const projects = await scanProjects('./test-data', ['.det', '.pou'], 10485760);
 * console.log(`Найдено ${projects.length} проектов`);
 */
export async function scanProjects(directoryPath, extensions = ['.det', '.pou'], maxFileSize = 0) {
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
      // Парсим файл для получения метаданных и расчетов
      const project = await parseDetFile(file.path);
      const summary = getProjectSummary(project);

      return {
        id: normalizeFilenameToId(file.name), // Normalized ID (slug)
        name: file.name.replace(/\.(det|pou)$/i, ''), // Display name (filename without extension)
        fileName: file.name,
        filePath: file.path,
        fileSize: file.size,
        modifiedAt: file.modifiedAt.toISOString(),
        createdAt: file.createdAt.toISOString(),
        format: summary.format,           // Формат файла ('det' или 'pou')
        numCylinders: summary.numCylinders,
        engineType: summary.engineType,
        calculationsCount: summary.calculationsCount
      };
    } catch (error) {
      console.error(`❌ Ошибка парсинга файла ${file.name}:`, error.message);

      // Возвращаем базовую информацию даже если парсинг не удался
      return {
        id: normalizeFilenameToId(file.name), // Normalized ID (slug)
        name: file.name.replace(/\.(det|pou)$/i, ''), // Display name
        fileName: file.name,
        filePath: file.path,
        fileSize: file.size,
        modifiedAt: file.modifiedAt.toISOString(),
        createdAt: file.createdAt.toISOString(),
        format: file.name.endsWith('.pou') ? 'pou' : 'det', // Определяем по расширению
        numCylinders: 0,
        engineType: 'UNKNOWN',
        calculationsCount: 0,
        error: error.message
      };
    }
  });

  const projects = await Promise.all(projectPromises);

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
 * const watcher = createFileWatcher('./test-data', ['.det', '.pou'], {
 *   onAdd: (path) => console.log(`Добавлен файл: ${path}`),
 *   onChange: (path) => console.log(`Изменён файл: ${path}`),
 *   onRemove: (path) => console.log(`Удалён файл: ${path}`),
 *   onError: (error) => console.error('Ошибка:', error)
 * });
 *
 * // Остановить отслеживание
 * await watcher.close();
 */
export function createFileWatcher(directoryPath, extensions = ['.det', '.pou'], callbacks = {}) {
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
    ignoreInitial: false,   // Триггерить 'add' для существующих файлов
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
 * const stats = await getDirectoryStats('./test-data', ['.det', '.pou']);
 * console.log(`Найдено ${stats.filesCount} файлов, общий размер: ${stats.totalSizeFormatted}`);
 */
export async function getDirectoryStats(directoryPath, extensions = ['.det', '.pou']) {
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
