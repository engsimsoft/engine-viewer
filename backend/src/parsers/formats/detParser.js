/**
 * Парсер для .det файлов двигателей
 *
 * Формат .det:
 * - 24 параметра (базовые характеристики двигателя)
 * - Строка 1: Метаданные (NumCylinders EngineType)
 * - Строка 2: Заголовки колонок
 * - Строка 3+: Маркеры расчётов ($) и данные
 *
 * ВАЖНО: Первая колонка - служебная (номер строки с символом →)
 * Данные начинаются со ВТОРОЙ колонки!
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';
import { cleanLine, parseCalculationMarker, isCalculationMarker } from '../common/calculationMarker.js';

/**
 * Маппинг названий параметров для унификации между форматами
 * .det файлы используют устаревшие названия, которые нужно преобразовать
 */
const PARAMETER_MAPPING = {
  'TCylMax': 'TC-Av'  // .det uses "TCylMax", unify to "TC-Av" (more accurate name)
};

/**
 * Преобразует название параметра согласно маппингу
 * Обрабатывает как базовые параметры, так и параметры с номером цилиндра
 *
 * @param {string} paramName - Исходное название параметра
 * @returns {string} - Преобразованное название параметра
 */
function mapParameterName(paramName) {
  // Извлекаем базовое название (без номера цилиндра)
  const baseName = paramName.replace(/\(\s*\d+\s*\)/, '').trim();

  // Применяем маппинг
  const mappedName = PARAMETER_MAPPING[baseName] || baseName;

  // Если был номер цилиндра, добавляем его к преобразованному названию
  const cylinderMatch = paramName.match(/\(\s*\d+\s*\)/);
  if (cylinderMatch) {
    return mappedName + cylinderMatch[0];
  }

  return mappedName;
}

/**
 * Парсер .det файлов
 */
class DetParser {
  /**
   * Парсит метаданные из первой строки .det файла
   * Формат: "           4 NATUR     NumCyl"
   *
   * @param {string} line - Первая строка файла
   * @returns {Object} - { numCylinders, engineType }
   */
  parseMetadata(line) {
    const cleaned = cleanLine(line);
    const parts = cleaned.split(/\s+/).filter(Boolean);

    if (parts.length < 2) {
      throw new Error('Некорректный формат метаданных в первой строке .det файла');
    }

    return {
      numCylinders: parseInt(parts[0], 10),
      engineType: parts[1]
    };
  }

  /**
   * Парсит заголовки колонок из второй строки .det файла
   * Формат: "     RPM        P-Av       Torque    PurCyl( 1)  PurCyl( 2) ..."
   *
   * Применяет маппинг названий для унификации с другими форматами
   *
   * @param {string} line - Вторая строка файла
   * @returns {string[]} - Массив заголовков (24 параметра)
   */
  parseColumnHeaders(line) {
    const cleaned = cleanLine(line);
    const headers = cleaned.split(/\s+/).filter(Boolean);

    // Применяем маппинг названий параметров
    const mappedHeaders = headers.map(header => mapParameterName(header));

    return mappedHeaders;
  }

  /**
   * Парсит одну строку данных из .det файла
   * Формат: "     4→     2600       33.69      123.73      0.8898      0.8898 ..."
   *
   * 24 параметра:
   * - RPM, P-Av, Torque (3 параметра)
   * - PurCyl(1-4) (4 параметра)
   * - TUbMax(1-4) (4 параметра)
   * - TC-Av(1-4) (4 параметра) [в файле TCylMax → маппинг в TC-Av]
   * - PCylMax(1-4) (4 параметра)
   * - Deto(1-4) (4 параметра)
   * - Convergence (1 параметр)
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
        `[DetParser] Несоответствие количества значений (${values.length}) и заголовков (${headers.length})`
      );
      console.warn(`Line: ${cleaned}`);
    }

    // Создаём объект DataPoint для .det формата
    const dataPoint = {
      RPM: parseFloat(values[0]),
      'P-Av': parseFloat(values[1]),
      Torque: parseFloat(values[2]),
      PurCyl: [],
      TUbMax: [],
      'TC-Av': [],  // Маппинг: TCylMax → TC-Av
      PCylMax: [],
      Deto: [],
      Convergence: 0
    };

    // Парсим данные по цилиндрам
    let currentIndex = 3; // Начинаем после RPM, P-Av, Torque

    // PurCyl (коэффициент наполнения)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.PurCyl.push(parseFloat(values[currentIndex++]));
    }

    // TUbMax (температура выпускных газов)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.TUbMax.push(parseFloat(values[currentIndex++]));
    }

    // TC-Av (температура в цилиндре, маппинг из TCylMax)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint['TC-Av'].push(parseFloat(values[currentIndex++]));
    }

    // PCylMax (давление в цилиндре)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.PCylMax.push(parseFloat(values[currentIndex++]));
    }

    // Deto (детонация)
    for (let i = 0; i < numCylinders; i++) {
      dataPoint.Deto.push(parseFloat(values[currentIndex++]));
    }

    // Convergence (сходимость)
    if (currentIndex < values.length) {
      dataPoint.Convergence = parseFloat(values[currentIndex]);
    }

    return dataPoint;
  }

  /**
   * Парсит .det файл и возвращает структурированные данные
   *
   * @param {string} filePath - Путь к .det файлу
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
          if (currentCalculation && currentCalculation.dataPoints.length >= 2) {
            calculations.push(currentCalculation);
          } else if (currentCalculation && currentCalculation.dataPoints.length === 1) {
            console.warn(
              `[DetParser] Skipping calculation "${currentCalculation.name}" - ` +
              `only 1 data point (minimum 2 required for visualization)`
            );
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
      if (currentCalculation && currentCalculation.dataPoints.length >= 2) {
        calculations.push(currentCalculation);
      } else if (currentCalculation && currentCalculation.dataPoints.length === 1) {
        console.warn(
          `[DetParser] Skipping calculation "${currentCalculation.name}" - ` +
          `only 1 data point (minimum 2 required for visualization)`
        );
      }

      // Формируем результат
      const result = {
        fileName: basename(filePath),
        format: 'det',
        metadata,
        columnHeaders,
        calculations
      };

      return result;
    } catch (error) {
      console.error(`[DetParser] Ошибка при парсинге файла ${filePath}:`, error);
      throw error;
    }
  }
}

export { DetParser };
