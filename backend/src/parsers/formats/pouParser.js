/**
 * Парсер для .pou файлов двигателей
 *
 * Формат .pou:
 * - 71 параметр (расширенный набор характеристик двигателя)
 * - Строка 1: Метаданные (NumCylinders EngineType Breath NumTurbo NumWasteGate)
 * - Строка 2: Заголовки колонок (71 параметр)
 * - Строка 3+: Маркеры расчётов ($) и данные
 *
 * ВАЖНО: Первая колонка - служебная (номер строки с символом →)
 * Данные начинаются со ВТОРОЙ колонки!
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';
import { cleanLine, parseCalculationMarker, isCalculationMarker } from '../common/calculationMarker.js';

/**
 * Маппинг параметров: .pou файл → каноническое название
 *
 * В .pou файлах некоторые параметры имеют сокращенные названия,
 * которые отличаются от канонических названий в .det файлах.
 * Этот маппинг обеспечивает унификацию.
 */
const PARAMETER_MAPPING = {
  'Purc': 'PurCyl',  // .pou использует "Purc", .det использует "PurCyl"
};

/**
 * Применяет маппинг к названию параметра
 *
 * @param {string} paramName - Оригинальное название из файла
 * @returns {string} - Каноническое название
 */
function mapParameterName(paramName) {
  // Убираем номера цилиндров из названия, если есть: "Purc( 1)" → "Purc"
  const baseName = paramName.replace(/\(\s*\d+\s*\)/, '').trim();

  // Применяем маппинг
  const mappedName = PARAMETER_MAPPING[baseName] || baseName;

  // Восстанавливаем номер цилиндра, если был: "Purc" → "PurCyl( 1)"
  const cylinderMatch = paramName.match(/\(\s*\d+\s*\)/);
  if (cylinderMatch) {
    return mappedName + cylinderMatch[0];
  }

  return mappedName;
}

/**
 * Парсер .pou файлов
 */
class PouParser {
  /**
   * Парсит метаданные из первой строки .pou файла
   * Формат: "           4 NATUR       0       0     NumCyl,Breath,NumTurbo,NumWasteGate"
   *
   * @param {string} line - Первая строка файла
   * @returns {Object} - { numCylinders, engineType, breath, numTurbo, numWasteGate }
   */
  parseMetadata(line) {
    const cleaned = cleanLine(line);
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length < 5) {
      throw new Error('Некорректный формат метаданных в первой строке .pou файла');
    }

    return {
      numCylinders: parseInt(parts[0], 10),
      engineType: parts[1],
      breath: parseInt(parts[2], 10),
      numTurbo: parseInt(parts[3], 10),
      numWasteGate: parseInt(parts[4], 10)
    };
  }

  /**
   * Парсит заголовки колонок из второй строки .pou файла
   * Формат: "     RPM        P-Av       Torque    TexAv   Power( 1)  Power( 2) ..."
   *
   * Применяет маппинг параметров для унификации названий (Purc → PurCyl).
   *
   * @param {string} line - Вторая строка файла
   * @returns {string[]} - Массив заголовков (71 параметр)
   */
  parseColumnHeaders(line) {
    const cleaned = cleanLine(line);
    const headers = cleaned.split(/\s+/).filter(Boolean);

    // Применяем маппинг к каждому заголовку
    const mappedHeaders = headers.map(header => mapParameterName(header));

    return mappedHeaders;
  }

  /**
   * Парсит одну строку данных из .pou файла
   * Формат: "     4→     3200       48.30      144.14     584.6      12.08      12.07 ..."
   *
   * 71 параметр:
   * - RPM, P-Av, Torque, TexAv (4 параметра)
   * - Power(1-4) (4 параметра)
   * - IMEP(1-4) (4 параметра)
   * - BMEP(1-4) (4 параметра)
   * - PMEP(1-4) (4 параметра)
   * - FMEP (1 параметр)
   * - DRatio(1-4) (4 параметра)
   * - PurCyl(1-4) (4 параметра)
   * - Seff(1-4) (4 параметра)
   * - Teff(1-4) (4 параметра)
   * - Ceff(1-4) (4 параметра)
   * - BSFC(1-4) (4 параметра)
   * - TC-Av(1-4) (4 параметра)
   * - TUbMax(1-4) (4 параметра)
   * - MaxDeg(1-4) (4 параметра)
   * - Timing (1 параметр)
   * - Delay(1-4) (4 параметра)
   * - Durat(1-4) (4 параметра)
   * - TAF (1 параметр)
   * - VibeDelay, VibeDurat, VibeA, VibeM (4 параметра)
   *
   * @param {string} line - Строка с данными
   * @param {string[]} headers - Заголовки колонок
   * @param {number} numCylinders - Количество цилиндров
   * @returns {Object|null} - Объект DataPoint или null если строка пустая
   */
  parseDataLine(line, headers, numCylinders) {
    const cleaned = cleanLine(line);

    // Если строка пустая или это маркер расчёта
    if (!cleaned || cleaned.startsWith('$')) {
      return null;
    }

    // Разбиваем по пробелам
    const values = cleaned.split(/\s+/).filter(Boolean);

    // Проверяем что количество значений соответствует заголовкам
    if (values.length !== headers.length) {
      console.warn(
        `[PouParser] Несоответствие количества значений (${values.length}) и заголовков (${headers.length})`
      );
      console.warn(`Line: ${cleaned}`);
    }

    // Создаём объект DataPoint для .pou формата
    const dataPoint = {
      RPM: parseFloat(values[0]),
      'P-Av': parseFloat(values[1]),
      Torque: parseFloat(values[2]),
      TexAv: parseFloat(values[3]),
      Power: [],
      IMEP: [],
      BMEP: [],
      PMEP: [],
      FMEP: 0,
      DRatio: [],
      PurCyl: [],
      Seff: [],
      Teff: [],
      Ceff: [],
      BSFC: [],
      'TC-Av': [],
      TUbMax: [],
      MaxDeg: [],
      Timing: 0,
      Delay: [],
      Durat: [],
      TAF: 0,
      VibeDelay: 0,
      VibeDurat: 0,
      VibeA: 0,
      VibeM: 0
    };

    // Парсим остальные параметры (начинаем с индекса 4)
    let idx = 4;

    // Power(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Power.push(parseFloat(values[idx++]));
    }

    // IMEP(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.IMEP.push(parseFloat(values[idx++]));
    }

    // BMEP(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.BMEP.push(parseFloat(values[idx++]));
    }

    // PMEP(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.PMEP.push(parseFloat(values[idx++]));
    }

    // FMEP
    dataPoint.FMEP = parseFloat(values[idx++]);

    // DRatio(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.DRatio.push(parseFloat(values[idx++]));
    }

    // PurCyl(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.PurCyl.push(parseFloat(values[idx++]));
    }

    // Seff(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Seff.push(parseFloat(values[idx++]));
    }

    // Teff(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Teff.push(parseFloat(values[idx++]));
    }

    // Ceff(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Ceff.push(parseFloat(values[idx++]));
    }

    // BSFC(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.BSFC.push(parseFloat(values[idx++]));
    }

    // TC-Av(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint['TC-Av'].push(parseFloat(values[idx++]));
    }

    // TUbMax(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.TUbMax.push(parseFloat(values[idx++]));
    }

    // MaxDeg(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.MaxDeg.push(parseFloat(values[idx++]));
    }

    // Timing
    dataPoint.Timing = parseFloat(values[idx++]);

    // Delay(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Delay.push(parseFloat(values[idx++]));
    }

    // Durat(1-4)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Durat.push(parseFloat(values[idx++]));
    }

    // TAF
    dataPoint.TAF = parseFloat(values[idx++]);

    // VibeDelay
    dataPoint.VibeDelay = parseFloat(values[idx++]);

    // VibeDurat
    dataPoint.VibeDurat = parseFloat(values[idx++]);

    // VibeA
    dataPoint.VibeA = parseFloat(values[idx++]);

    // VibeM
    dataPoint.VibeM = parseFloat(values[idx++]);

    return dataPoint;
  }

  /**
   * Парсит .pou файл и возвращает структурированные данные
   *
   * @param {string} filePath - Путь к .pou файлу
   * @returns {Promise<Object>} - Объект EngineProject
   */
  async parse(filePath) {
    try {
      // Читаем файл
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      if (lines.length < 3) {
        throw new Error('Файл слишком короткий, должен содержать минимум 3 строки');
      }

      // Парсим метаданные (строка 1)
      const metadata = this.parseMetadata(lines[0]);

      // Парсим заголовки (строка 2)
      const columnHeaders = this.parseColumnHeaders(lines[1]);

      // Парсим расчёты (строка 3+)
      const calculations = [];
      let currentCalculation = null;

      for (let i = 2; i < lines.length; i++) {
        const line = lines[i];

        // Пропускаем пустые строки
        if (!line.trim()) {
          continue;
        }

        // Проверяем, является ли строка маркером расчёта
        if (isCalculationMarker(line)) {
          // Сохраняем предыдущий расчёт (если был)
          if (currentCalculation && currentCalculation.dataPoints.length > 0) {
            calculations.push(currentCalculation);
          }

          // Начинаем новый расчёт
          const { id, name } = parseCalculationMarker(line);
          currentCalculation = {
            id,
            name,
            dataPoints: []
          };
        } else if (currentCalculation) {
          // Парсим строку данных
          const dataPoint = this.parseDataLine(line, columnHeaders, metadata.numCylinders);

          if (dataPoint) {
            currentCalculation.dataPoints.push(dataPoint);
          }
        }
      }

      // Добавляем последний расчёт
      if (currentCalculation && currentCalculation.dataPoints.length > 0) {
        calculations.push(currentCalculation);
      }

      // Формируем результат
      const result = {
        fileName: basename(filePath),
        format: 'pou',
        metadata,
        columnHeaders,
        calculations
      };

      return result;
    } catch (error) {
      console.error(`[PouParser] Ошибка при парсинге файла ${filePath}:`, error);
      throw error;
    }
  }
}

export { PouParser };
