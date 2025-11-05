/**
 * Модуль автоопределения формата файлов двигателей
 * Определяет формат по расширению файла и содержимому первой строки
 *
 * Поддерживаемые форматы:
 * - .det: 24 параметра (базовые характеристики)
 * - .pou: 71 параметр (расширенный набор)
 * - .prt: Метаданные проекта (engine specs, intake/exhaust configuration)
 */

import { basename } from 'path';
import { cleanLine } from './calculationMarker.js';

/**
 * Определяет формат файла по расширению
 * @param {string} filePath - Путь к файлу
 * @returns {string|null} - 'det', 'pou', 'prt' или null если формат неизвестен
 */
function detectFormatByExtension(filePath) {
  const fileName = basename(filePath).toLowerCase();

  if (fileName.endsWith('.det')) {
    return 'det';
  }

  if (fileName.endsWith('.pou')) {
    return 'pou';
  }

  if (fileName.endsWith('.prt')) {
    return 'prt';
  }

  return null;
}

/**
 * Определяет формат файла по содержимому первой строки (метаданные)
 *
 * Формат .det: "           4 NATUR     NumCyl"
 *   → 2 поля: NumCylinders, EngineType
 *
 * Формат .pou: "           4 NATUR       0       0     NumCyl,Breath,NumTurbo,NumWasteGate"
 *   → 5 полей: NumCylinders, EngineType, Breath, NumTurbo, NumWasteGate
 *
 * @param {string} firstLine - Первая строка файла
 * @returns {string|null} - 'det', 'pou' или null если не удалось определить
 */
function detectFormatByContent(firstLine) {
  const cleaned = cleanLine(firstLine);
  const parts = cleaned.split(/\s+/).filter(Boolean);

  // .pou имеет больше полей метаданных (5+ вместо 2)
  if (parts.length >= 5) {
    return 'pou';
  }

  if (parts.length >= 2) {
    return 'det';
  }

  return null;
}

/**
 * Определяет формат файла (комбинированный подход)
 *
 * Порядок проверки:
 * 1. По расширению файла (быстро и надёжно)
 * 2. По содержимому первой строки (если расширение неизвестно)
 *
 * @param {string} filePath - Путь к файлу
 * @param {string} firstLine - Первая строка файла
 * @returns {string} - 'det', 'pou' или 'prt'
 * @throws {Error} - Если формат не удалось определить
 */
function detectFormat(filePath, firstLine) {
  // Сначала пытаемся определить по расширению (быстро)
  let format = detectFormatByExtension(filePath);

  if (format) {
    return format;
  }

  // Если расширение неизвестно, анализируем содержимое
  // (для .prt файлов это не применимо, только для .det/.pou)
  format = detectFormatByContent(firstLine);

  if (format) {
    return format;
  }

  // Если не удалось определить формат
  throw new Error(
    `Не удалось определить формат файла: ${filePath}. ` +
    `Поддерживаемые форматы: .det, .pou, .prt`
  );
}

/**
 * Проверяет, поддерживается ли данный формат
 * @param {string} format - Формат файла ('det', 'pou', 'prt', и т.д.)
 * @returns {boolean} - true если формат поддерживается
 */
function isSupportedFormat(format) {
  const supportedFormats = ['det', 'pou', 'prt'];
  return supportedFormats.includes(format);
}

export {
  detectFormat,
  detectFormatByExtension,
  detectFormatByContent,
  isSupportedFormat
};
