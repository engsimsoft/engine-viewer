/**
 * Сервис для парсинга файлов двигателей
 *
 * Использует новую архитектуру парсеров:
 * - Автоматическое определение формата файла
 * - Поддержка .det и .pou файлов
 * - Легко расширяется для новых форматов
 *
 * ВАЖНО: Этот файл является адаптером между старым API и новой архитектурой.
 * Старые функции (parseDetFile, parseAllDetFiles) оставлены для обратной совместимости.
 */

import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, parse, dirname, basename } from 'path';
import { parseEngineFile } from '../parsers/index.js';
import { mergeDetPouData } from './fileMerger.js';

/**
 * Парсит файл двигателя (.det, .pou, и т.д.)
 * АВТОМАТИЧЕСКИЙ MERGE: Если существуют оба файла (.det + .pou),
 * объединяет данные (берёт .pou + добавляет TCylMax, Convergence из .det)
 *
 * @param {string} filePath - Путь к файлу
 * @returns {Promise<Object>} - Объект EngineProject (возможно merged с format: 'pou-merged')
 */
async function parseDetFile(filePath) {
  try {
    // Получаем базовое имя файла без расширения
    const dir = dirname(filePath);
    const fileBaseName = basename(filePath).replace(/\.(det|pou)$/i, '');

    // Пути к обоим файлам
    const pouPath = join(dir, `${fileBaseName}.pou`);
    const detPath = join(dir, `${fileBaseName}.det`);

    // Проверяем существование обоих файлов
    const hasPou = existsSync(pouPath);
    const hasDet = existsSync(detPath);

    // Если оба файла существуют - делаем merge
    if (hasPou && hasDet) {
      console.log(`[FileParser] Найдены оба файла для "${fileBaseName}", выполняю merge...`);

      const pouProject = await parseEngineFile(pouPath);
      const detProject = await parseEngineFile(detPath);

      // Используем новую правильную функцию merge из fileMerger.js
      // Она добавляет TCylMax, Convergence и устанавливает format: 'pou-merged'
      const merged = mergeDetPouData(pouProject, detProject);
      return merged;
    }

    // Если только один файл - парсим как обычно
    const result = await parseEngineFile(filePath);
    return result;
  } catch (error) {
    console.error(`Ошибка при парсинге файла ${filePath}:`, error);
    throw error;
  }
}

/**
 * Получает список всех файлов двигателей (.det, .pou) в директории
 *
 * @param {string} directoryPath - Путь к директории
 * @returns {Promise<string[]>} - Массив путей к файлам
 */
async function getDetFiles(directoryPath) {
  try {
    const files = await readdir(directoryPath);

    // Поддерживаем оба формата: .det и .pou
    const engineFiles = files
      .filter(file => {
        const lowerFile = file.toLowerCase();
        return lowerFile.endsWith('.det') || lowerFile.endsWith('.pou');
      })
      .map(file => join(directoryPath, file));

    return engineFiles;
  } catch (error) {
    console.error(`Ошибка при чтении директории ${directoryPath}:`, error);
    throw error;
  }
}

/**
 * Парсит все файлы двигателей (.det, .pou) в директории
 *
 * @param {string} directoryPath - Путь к директории
 * @returns {Promise<Object[]>} - Массив объектов EngineProject
 */
async function parseAllDetFiles(directoryPath) {
  try {
    const engineFiles = await getDetFiles(directoryPath);

    const projects = await Promise.all(
      engineFiles.map(filePath => parseDetFile(filePath))
    );

    return projects;
  } catch (error) {
    console.error('Ошибка при парсинге файлов двигателей:', error);
    throw error;
  }
}

/**
 * Получает краткую информацию о проекте (для списка проектов)
 *
 * @param {Object} project - Объект EngineProject
 * @returns {Object} - Краткая информация о проекте
 */
function getProjectSummary(project) {
  return {
    id: parse(project.fileName).name, // Имя файла без расширения
    fileName: project.fileName,
    format: project.format,           // Формат файла ('det' или 'pou')
    engineType: project.metadata.engineType,
    numCylinders: project.metadata.numCylinders,
    calculationsCount: project.calculations.length
  };
}

export {
  parseDetFile,
  parseAllDetFiles,
  getDetFiles,
  getProjectSummary
};
