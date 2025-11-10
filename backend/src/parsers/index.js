/**
 * Единый API для парсинга файлов двигателей
 *
 * Автоматически определяет формат файла и использует соответствующий парсер.
 * Поддерживаемые форматы:
 * - .det: 24 параметра (базовые характеристики)
 * - .pou: 71 параметр (расширенный набор)
 * - .prt: Метаданные проекта (engine specs, intake/exhaust configuration)
 * - .pvd: PV-Diagrams (pressure-volume diagrams, 721 точек × N цилиндров)
 *
 * Пример использования:
 *   import { parseEngineFile } from './parsers/index.js';
 *
 *   const data = await parseEngineFile('/path/to/file.det');
 *   console.log(data.format); // 'det'
 *   console.log(data.calculations); // массив расчётов
 */

import { readFile } from 'fs/promises';
import { globalRegistry } from './ParserRegistry.js';
import { DetParser } from './formats/detParser.js';
import { PouParser } from './formats/pouParser.js';
import { PrtParser } from './formats/prtParser.js';
import { PvdParser } from './formats/pvdParser.js';
import { detectFormat } from './common/formatDetector.js';

// Регистрируем парсеры при импорте модуля
function registerParsers() {
  try {
    globalRegistry.register('det', DetParser);
    globalRegistry.register('pou', PouParser);
    globalRegistry.register('prt', PrtParser);
    globalRegistry.register('pvd', PvdParser);
  } catch (error) {
    // Игнорируем ошибку если парсеры уже зарегистрированы
    if (!error.message.includes('уже зарегистрирован')) {
      throw error;
    }
  }
}

// Регистрируем парсеры
registerParsers();

/**
 * Парсит файл двигателя (автоматическое определение формата)
 *
 * @param {string} filePath - Путь к файлу (.det, .pou, и т.д.)
 * @returns {Promise<Object>} - Объект EngineProject
 * @throws {Error} - Если формат файла не поддерживается
 */
async function parseEngineFile(filePath) {
  try {
    // Читаем первую строку для определения формата
    const content = await readFile(filePath, 'utf-8');
    const firstLine = content.split('\n')[0];

    // Определяем формат файла
    const format = detectFormat(filePath, firstLine);

    // Получаем парсер для этого формата
    const parser = globalRegistry.getParser(format);

    // Парсим файл
    const result = await parser.parse(filePath);

    return result;
  } catch (error) {
    console.error(`[ParserAPI] Ошибка при парсинге файла ${filePath}:`, error);
    throw error;
  }
}

/**
 * Получает список поддерживаемых форматов файлов
 *
 * @returns {string[]} - Массив форматов ('det', 'pou', и т.д.)
 */
function getSupportedFormats() {
  return globalRegistry.getSupportedFormats();
}

/**
 * Проверяет, поддерживается ли указанный формат
 *
 * @param {string} format - Формат файла ('det', 'pou', и т.д.)
 * @returns {boolean} - true если формат поддерживается
 */
function isSupportedFormat(format) {
  return globalRegistry.hasParser(format);
}

/**
 * Регистрирует новый парсер (для расширения системы)
 *
 * @param {string} format - Формат файла
 * @param {Function} ParserClass - Класс парсера
 */
function registerParser(format, ParserClass) {
  globalRegistry.register(format, ParserClass);
}

export {
  parseEngineFile,
  getSupportedFormats,
  isSupportedFormat,
  registerParser,
  globalRegistry
};
