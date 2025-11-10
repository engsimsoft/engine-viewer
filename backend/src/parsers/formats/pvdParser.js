/**
 * Парсер для .pvd файлов (PV-Diagram)
 *
 * Формат .pvd:
 * - Строка 1: RPM
 * - Строка 2: NumCyl NumTurbo NumExPas NumSuper
 * - Строки 3-15: System configuration (pipes, collectors, boxes)
 * - Строки 16-17: Firing order / Ignition timing (2 строки!)
 * - Строка 18: Заголовки колонок (Deg + Cylinder(1) Cylinder(2) ...)
 * - Строка 19+: Данные (721 строка: 0-720°, каждый цилиндр = Volume + Pressure)
 *
 * Структура данных:
 * - Deg: 0-720° (crank angle)
 * - Для каждого цилиндра: Volume (cm³) и Pressure (bar)
 *
 * Naming convention: ProjectName_RPM.pvd (например: V8_2000.pvd)
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';

/**
 * Очищает строку от лишних пробелов и служебной колонки
 * @param {string} line - Исходная строка
 * @returns {string} - Очищенная строка
 */
function cleanLine(line) {
  return line.trim();
}

/**
 * Парсер .pvd файлов
 */
class PvdParser {
  /**
   * Парсит метаданные из первых 16 строк .pvd файла
   *
   * @param {string[]} lines - Массив строк файла
   * @returns {Object} - Объект с метаданными
   */
  parseMetadata(lines) {
    // Строка 1: RPM
    const rpmLine = cleanLine(lines[0]);
    const rpmParts = rpmLine.split(/\s+/).filter(Boolean);
    const rpm = parseInt(rpmParts[0], 10);

    // Строка 2: NumCyl NumTurbo NumExPas NumSuper
    const configLine = cleanLine(lines[1]);
    const configParts = configLine.split(/\s+/).filter(Boolean);
    const numCylinders = parseInt(configParts[0], 10);
    const numTurbo = parseInt(configParts[1], 10);
    const numExPas = parseInt(configParts[2], 10);
    const numSuper = parseInt(configParts[3], 10);

    // Строки 3-15: System configuration (optional parsing)
    const numPipIn = parseInt(cleanLine(lines[2]).split(/\s+/)[0], 10);
    const numColIn = parseInt(cleanLine(lines[3]).split(/\s+/)[0], 10);
    const numBoxIn = parseInt(cleanLine(lines[4]).split(/\s+/)[0], 10);
    const numPipEx = parseInt(cleanLine(lines[5]).split(/\s+/)[0], 10);
    const numColEx = parseInt(cleanLine(lines[6]).split(/\s+/)[0], 10);
    const numBoxEx = parseInt(cleanLine(lines[7]).split(/\s+/)[0], 10);
    const numOutPipEx = parseInt(cleanLine(lines[8]).split(/\s+/)[0], 10);
    const numStepExH = parseInt(cleanLine(lines[9]).split(/\s+/)[0], 10);
    const numStepEx = parseInt(cleanLine(lines[10]).split(/\s+/)[0], 10);
    const numExSil = parseInt(cleanLine(lines[11]).split(/\s+/)[0], 10);
    const numExSilPlen = parseInt(cleanLine(lines[12]).split(/\s+/)[0], 10);
    const iTraceL = parseFloat(cleanLine(lines[13]).split(/\s+/)[0]);
    const eTraceL = parseFloat(cleanLine(lines[14]).split(/\s+/)[0]);

    // Строки 16-17: Firing order / Ignition timing (2 строки для V8)
    const firingOrderLine1 = cleanLine(lines[15]);
    const firingOrderLine2 = cleanLine(lines[16]);
    const firingOrder = [
      ...firingOrderLine1.split(/\s+/).filter(Boolean).map(parseFloat),
      ...firingOrderLine2.split(/\s+/).filter(Boolean).map(parseFloat)
    ];

    // Определяем тип двигателя
    const engineType = numTurbo > 0 ? 'TURBO' : 'NATUR';

    return {
      rpm,
      cylinders: numCylinders,
      engineType,
      numTurbo,
      numExPas,
      numSuper,
      systemConfig: {
        numPipIn,
        numColIn,
        numBoxIn,
        numPipEx,
        numColEx,
        numBoxEx,
        numOutPipEx,
        numStepExH,
        numStepEx,
        numExSil,
        numExSilPlen,
        iTraceL,
        eTraceL
      },
      firingOrder
    };
  }

  /**
   * Парсит заголовки колонок из строки 18
   * Формат: "     Deg         Cylinder(1)     Cylinder(2) ..."
   *
   * @param {string} line - Строка с заголовками
   * @returns {string[]} - Массив заголовков
   */
  parseColumnHeaders(line) {
    const cleaned = cleanLine(line);
    const headers = cleaned.split(/\s+/).filter(Boolean);
    return headers;
  }

  /**
   * Парсит одну строку данных (строка 19+)
   * Формат: "    0.000000   561.663574     1.539665    61.333782     1.022993 ..."
   *
   * Структура: Deg + (Volume, Pressure) × NumCylinders
   *
   * @param {string} line - Строка с данными
   * @param {number} numCylinders - Количество цилиндров
   * @returns {Object|null} - Объект DataPoint или null если строка пустая
   */
  parseDataLine(line, numCylinders) {
    const cleaned = cleanLine(line);

    // Пропускаем пустые строки
    if (!cleaned) {
      return null;
    }

    // Разбиваем по пробелам
    const values = cleaned.split(/\s+/).filter(Boolean);

    // Проверяем минимальное количество значений (Deg + 2 × NumCylinders)
    const expectedColumns = 1 + (numCylinders * 2);
    if (values.length < expectedColumns) {
      console.warn(
        `[PvdParser] Insufficient values (${values.length}), expected ${expectedColumns}`
      );
      return null;
    }

    // Парсим Deg (crank angle)
    const deg = parseFloat(values[0]);

    // Парсим данные по цилиндрам (Volume, Pressure для каждого)
    const cylinders = [];
    for (let i = 0; i < numCylinders; i++) {
      const volumeIndex = 1 + (i * 2);
      const pressureIndex = 1 + (i * 2) + 1;

      cylinders.push({
        volume: parseFloat(values[volumeIndex]),
        pressure: parseFloat(values[pressureIndex])
      });
    }

    return {
      deg,
      cylinders
    };
  }

  /**
   * Парсит .pvd файл и возвращает структурированные данные
   *
   * @param {string} filePath - Путь к .pvd файлу
   * @returns {Promise<Object>} - Объект PVDData
   */
  async parse(filePath) {
    try {
      // Читаем файл
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      if (lines.length < 20) {
        throw new Error('Файл слишком короткий, должен содержать минимум 20 строк');
      }

      // Парсим метаданные (строки 1-17, включая firing order)
      const metadata = this.parseMetadata(lines);

      // Парсим заголовки (строка 18, индекс 17)
      const columnHeaders = this.parseColumnHeaders(lines[17]);

      // Парсим данные (строка 19+, индекс 18+)
      const data = [];
      for (let i = 18; i < lines.length; i++) {
        const dataPoint = this.parseDataLine(lines[i], metadata.cylinders);

        if (dataPoint) {
          data.push(dataPoint);
        }
      }

      // Формируем результат
      const result = {
        fileName: basename(filePath),
        format: 'pvd',
        metadata,
        columnHeaders,
        data
      };

      return result;
    } catch (error) {
      console.error(`[PvdParser] Ошибка при парсинге файла ${filePath}:`, error);
      throw error;
    }
  }
}

export { PvdParser };
