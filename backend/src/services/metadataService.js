/**
 * Metadata Service
 *
 * Управление метаданными проектов
 * Хранение: .metadata/<projectId>.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Получить метаданные проекта
 * @param {string} projectId - ID проекта
 * @returns {Promise<Object|null>} Метаданные проекта или null если не найдены
 */
export async function getMetadata(projectId) {
  try {
    const filePath = getMetadataFilePath(projectId);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const metadata = JSON.parse(fileContent);
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
 * Сохранить метаданные проекта
 * @param {string} projectId - ID проекта
 * @param {Object} metadata - Метаданные для сохранения
 * @returns {Promise<Object>} Сохранённые метаданные (с обновлёнными timestamps)
 */
export async function saveMetadata(projectId, metadata) {
  try {
    // Убедиться что директория существует
    await ensureMetadataDir();

    // Проверить существование метаданных и получить createdAt если они уже есть
    const existingMetadata = await getMetadata(projectId);
    const now = new Date().toISOString();

    // Подготовить данные для сохранения
    const dataToSave = {
      ...metadata,
      projectId, // Гарантируем что projectId совпадает
      updatedAt: now,
      // Если метаданные существуют - сохранить createdAt, иначе установить текущее время
      createdAt: existingMetadata?.createdAt || now
    };

    // Сохранить в файл с красивым форматированием
    const filePath = getMetadataFilePath(projectId);
    const jsonContent = JSON.stringify(dataToSave, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf8');

    return dataToSave;
  } catch (error) {
    throw new Error(`Failed to save metadata for project ${projectId}: ${error.message}`);
  }
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
  deleteMetadata,
  getAllMetadata
};
