/**
 * Metadata Service (v1.0)
 *
 * Управление метаданными проектов
 * Хранение: .metadata/<projectId>.json
 *
 * Structure v1.0:
 * {
 *   "version": "1.0",
 *   "id": "project-id",
 *   "displayName": "",
 *   "auto": { cylinders, type, bore, stroke, intakeSystem, exhaustSystem, ... },
 *   "manual": { description, client, tags, status, notes, color },
 *   "created": "ISO timestamp",
 *   "modified": "ISO timestamp"
 * }
 *
 * Rules:
 * - "auto" section: readonly for users, updated from .prt file
 * - "manual" section: editable by users
 * - Backward compatibility: reads old format (pre-v1.0)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mutex } from 'async-mutex';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mutex storage: one mutex per projectId to prevent concurrent writes
const mutexes = new Map();

/**
 * Get or create mutex for a specific projectId
 * Lazy initialization: creates mutex only when needed
 * @param {string} projectId - Project ID
 * @returns {Mutex} Mutex instance for this projectId
 */
function getOrCreateMutex(projectId) {
  if (!mutexes.has(projectId)) {
    mutexes.set(projectId, new Mutex());
  }
  return mutexes.get(projectId);
}

/**
 * Получить путь к директории с метаданными
 * @returns {string} Абсолютный путь к .metadata/
 */
export function getMetadataDir() {
  // Путь относительно корня проекта (backend/src/services -> ../../.metadata)
  const projectRoot = path.join(__dirname, '..', '..', '..');
  return path.join(projectRoot, '.metadata');
}

/**
 * Получить путь к файлу метаданных для конкретного проекта
 * @param {string} projectId - ID проекта (имя файла без расширения)
 * @returns {string} Абсолютный путь к JSON файлу метаданных
 */
export function getMetadataFilePath(projectId) {
  return path.join(getMetadataDir(), `${projectId}.json`);
}

/**
 * Мигрирует старый формат metadata в новый (v1.0)
 * Вызывается автоматически при чтении старого формата
 * @param {Object} oldMetadata - Старая структура метаданных
 * @param {string} projectId - ID проекта
 * @returns {Object} - Новая структура (v1.0)
 */
function migrateOldFormat(oldMetadata, projectId) {
  // Если уже v1.0 - вернуть как есть
  if (oldMetadata.version === '1.0') {
    return oldMetadata;
  }

  // Мигрируем старый формат → v1.0
  const manual = {
    description: oldMetadata.description || '',
    client: oldMetadata.client || '',
    tags: oldMetadata.tags || [],
    status: oldMetadata.status || 'active',
    notes: oldMetadata.notes || '',
    color: oldMetadata.color || ''
  };

  return {
    version: '1.0',
    id: oldMetadata.projectId || projectId,
    displayName: '', // По умолчанию пустой
    // auto: будет добавлено fileScanner
    manual,
    created: oldMetadata.createdAt || new Date().toISOString(),
    modified: oldMetadata.updatedAt || new Date().toISOString()
  };
}

/**
 * Получить метаданные проекта
 * @param {string} projectId - ID проекта
 * @returns {Promise<Object|null>} Метаданные проекта или null если не найдены
 */
export async function getMetadata(projectId) {
  try {
    const filePath = getMetadataFilePath(projectId);
    const fileContent = await fs.readFile(filePath, 'utf8');
    let metadata = JSON.parse(fileContent);

    // Backward compatibility: мигрируем старый формат
    if (!metadata.version || metadata.version !== '1.0') {
      metadata = migrateOldFormat(metadata, projectId);
      // Сохраняем мигрированную версию
      await saveMetadata(projectId, metadata);
    }

    return metadata;
  } catch (error) {
    // Если файл не существует - это нормально (метаданные опциональные)
    if (error.code === 'ENOENT') {
      return null;
    }
    // Другие ошибки (например, невалидный JSON) - прокидываем дальше
    throw new Error(`Failed to read metadata for project ${projectId}: ${error.message}`);
  }
}

/**
 * Проверить существование метаданных для проекта
 * @param {string} projectId - ID проекта
 * @returns {Promise<boolean>} true если метаданные существуют
 */
export async function hasMetadata(projectId) {
  try {
    const filePath = getMetadataFilePath(projectId);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Убедиться что директория .metadata существует
 * Создаёт директорию если её нет
 * @returns {Promise<void>}
 */
export async function ensureMetadataDir() {
  const metadataDir = getMetadataDir();
  try {
    await fs.mkdir(metadataDir, { recursive: true });
  } catch (error) {
    // Если директория уже существует - ничего страшного
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create metadata directory: ${error.message}`);
    }
  }
}

/**
 * Сохранить метаданные проекта (v1.0)
 * @param {string} projectId - ID проекта
 * @param {Object} metadata - Метаданные для сохранения (полная структура v1.0)
 * @returns {Promise<Object>} Сохранённые метаданные (с обновлёнными timestamps)
 */
export async function saveMetadata(projectId, metadata) {
  const mutex = getOrCreateMutex(projectId);

  return mutex.runExclusive(async () => {
    try {
      // Убедиться что директория существует
      await ensureMetadataDir();

      // Проверить существование метаданных
      const existingMetadata = await getMetadata(projectId);
      const now = new Date().toISOString();

      // Подготовить данные для сохранения (v1.0 format)
      const dataToSave = {
        version: '1.0',
        id: projectId, // Гарантируем что ID совпадает
        displayName: metadata.displayName || '',
        auto: metadata.auto || existingMetadata?.auto, // Сохранить существующий auto
        manual: metadata.manual || {},
        created: existingMetadata?.created || now,
        modified: now
      };

      // Сохранить в файл с красивым форматированием
      const filePath = getMetadataFilePath(projectId);
      const jsonContent = JSON.stringify(dataToSave, null, 2);
      await fs.writeFile(filePath, jsonContent, 'utf8');

      return dataToSave;
    } catch (error) {
      throw new Error(`Failed to save metadata for project ${projectId}: ${error.message}`);
    }
  });
}

/**
 * Обновить только "auto" секцию метаданных (from .prt file)
 * Сохраняет существующий "manual" section
 * @param {string} projectId - ID проекта
 * @param {Object} autoMetadata - Автоматические метаданные из .prt
 * @returns {Promise<Object>} Обновлённые метаданные
 */
export async function updateAutoMetadata(projectId, autoMetadata) {
  const mutex = getOrCreateMutex(projectId);

  return mutex.runExclusive(async () => {
    try {
      await ensureMetadataDir();

      // Получить существующие метаданные
      const existingMetadata = await getMetadata(projectId);
      const now = new Date().toISOString();

      // Создать или обновить metadata
      const dataToSave = {
        version: '1.0',
        id: projectId,
        displayName: existingMetadata?.displayName || '',
        auto: autoMetadata, // Обновляем auto section
        manual: existingMetadata?.manual || {}, // Сохраняем manual section
        created: existingMetadata?.created || now,
        modified: now
      };

      // Сохранить
      const filePath = getMetadataFilePath(projectId);
      const jsonContent = JSON.stringify(dataToSave, null, 2);
      await fs.writeFile(filePath, jsonContent, 'utf8');

      return dataToSave;
    } catch (error) {
      throw new Error(`Failed to update auto metadata for project ${projectId}: ${error.message}`);
    }
  });
}

/**
 * Обновить только "manual" секцию метаданных (user edits)
 * Сохраняет существующий "auto" section
 * @param {string} projectId - ID проекта
 * @param {Object} manualMetadata - Пользовательские метаданные
 * @returns {Promise<Object>} Обновлённые метаданные
 */
export async function updateManualMetadata(projectId, manualMetadata) {
  const mutex = getOrCreateMutex(projectId);

  return mutex.runExclusive(async () => {
    try {
      await ensureMetadataDir();

      // Получить существующие метаданные
      const existingMetadata = await getMetadata(projectId);
      const now = new Date().toISOString();

      // Создать или обновить metadata
      const dataToSave = {
        version: '1.0',
        id: projectId,
        displayName: manualMetadata.displayName ?? existingMetadata?.displayName ?? '',
        auto: existingMetadata?.auto, // Сохраняем auto section
        manual: {
          description: manualMetadata.description || '',
          client: manualMetadata.client || '',
          tags: manualMetadata.tags || [],
          status: manualMetadata.status || 'active',
          notes: manualMetadata.notes || '',
          color: manualMetadata.color || ''
        },
        created: existingMetadata?.created || now,
        modified: now
      };

      // Сохранить
      const filePath = getMetadataFilePath(projectId);
      const jsonContent = JSON.stringify(dataToSave, null, 2);
      await fs.writeFile(filePath, jsonContent, 'utf8');

      return dataToSave;
    } catch (error) {
      throw new Error(`Failed to update manual metadata for project ${projectId}: ${error.message}`);
    }
  });
}

/**
 * Удалить метаданные проекта
 * @param {string} projectId - ID проекта
 * @returns {Promise<boolean>} true если метаданные были удалены, false если их не было
 */
export async function deleteMetadata(projectId) {
  try {
    const filePath = getMetadataFilePath(projectId);
    await fs.unlink(filePath);
    return true; // Файл успешно удалён
  } catch (error) {
    // Если файл не существует - это не ошибка, просто возвращаем false
    if (error.code === 'ENOENT') {
      return false;
    }
    // Другие ошибки - прокидываем дальше
    throw new Error(`Failed to delete metadata for project ${projectId}: ${error.message}`);
  }
}

/**
 * Получить все метаданные для всех проектов
 * @returns {Promise<Map<string, Object>>} Map с projectId → metadata
 */
export async function getAllMetadata() {
  const metadataMap = new Map();

  try {
    const metadataDir = getMetadataDir();

    // Проверить что директория существует
    try {
      await fs.access(metadataDir);
    } catch {
      // Директория не существует - возвращаем пустую Map
      return metadataMap;
    }

    // Прочитать все файлы в директории
    const files = await fs.readdir(metadataDir);

    // Загрузить метаданные из каждого .json файла
    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue; // Пропускаем не-JSON файлы
      }

      // Извлечь projectId из имени файла (без .json)
      const projectId = file.replace('.json', '');

      try {
        const metadata = await getMetadata(projectId);
        if (metadata) {
          metadataMap.set(projectId, metadata);
        }
      } catch (error) {
        // Если не удалось прочитать конкретный файл - логируем и продолжаем
        console.warn(`Failed to load metadata for ${projectId}:`, error.message);
      }
    }

    return metadataMap;
  } catch (error) {
    console.error('Error loading all metadata:', error);
    // В случае ошибки возвращаем пустую Map вместо падения сервера
    return metadataMap;
  }
}

// Default export
export default {
  getMetadataDir,
  getMetadataFilePath,
  getMetadata,
  hasMetadata,
  ensureMetadataDir,
  saveMetadata,
  updateAutoMetadata,
  updateManualMetadata,
  deleteMetadata,
  getAllMetadata
};
