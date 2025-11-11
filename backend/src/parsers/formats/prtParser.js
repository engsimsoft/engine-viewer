/**
 * Парсер для .prt файлов двигателей (Project metadata files)
 *
 * Формат .prt:
 * - Текстовый документ с метаданными двигателя
 * - НЕ табличные данные (в отличие от .det/.pou)
 * - Содержит engine specs, intake/exhaust configuration
 * - Создаётся программой Dat4T (EngMod4T Suite)
 *
 * ВАЖНО: .prt файлы используются для извлечения "auto" metadata
 * которая затем объединяется с "manual" user metadata
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';

/**
 * Парсер .prt файлов
 */
class PrtParser {
  /**
   * Извлекает значение после двоеточия из строки
   * Пример: "Bore                                        82.50000      mm" → "82.50000"
   *
   * @param {string} line - Строка для парсинга
   * @returns {string|null} - Извлечённое значение или null
   */
  extractValue(line) {
    // Ищем последовательность: текст, много пробелов, число, возможно единицы
    const match = line.match(/:\s*(.+?)(?:\s+\w+)?\s*$/);
    if (match) {
      return match[1].trim();
    }

    // Альтернативный паттерн: ищем первое числовое значение после множественных пробелов
    const parts = line.trim().split(/\s{2,}/); // Разделение по множественным пробелам
    if (parts.length >= 2) {
      // Находим первое числовое значение (пропускаем единицы измерения)
      for (let i = 1; i < parts.length; i++) {
        const value = parts[i].trim();
        // Проверяем что это число (может содержать точку, минус, научную нотацию)
        if (/^[-+]?[\d.]+(?:[eE][-+]?\d+)?$/.test(value)) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Парсит название проекта из .prt файла
   * Формат: "              4_Cyl_ITB                 engine"
   *
   * @param {string} line - Строка с названием проекта (обычно line 8)
   * @returns {string} - Название проекта
   */
  parseProjectName(line) {
    // Убираем слово "engine" и лишние пробелы
    const cleaned = line.replace(/engine/i, '').trim();
    return cleaned;
  }

  /**
   * Парсит дату создания файла
   * Формат строки 1: "This dataFile was constructed on:  4-11-2025"
   * Формат строки 2: "at: 18h: 4min"
   *
   * @param {string} dateLine - Строка с датой
   * @param {string} timeLine - Строка со временем
   * @returns {string} - ISO 8601 timestamp
   */
  parseCreationDate(dateLine, timeLine) {
    // Извлекаем дату: "4-11-2025"
    const dateMatch = dateLine.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (!dateMatch) {
      return new Date().toISOString();
    }

    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];

    // Извлекаем время: "18h: 4min"
    const timeMatch = timeLine.match(/(\d{1,2})h:\s*(\d{1,2})min/);
    let hours = '00';
    let minutes = '00';

    if (timeMatch) {
      hours = timeMatch[1].padStart(2, '0');
      minutes = timeMatch[2].padStart(2, '0');
    }

    // Формируем ISO 8601 timestamp
    // Формат: YYYY-MM-DDTHH:mm:ssZ
    const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;

    return isoDate;
  }

  /**
   * Парсит версию Dat4T
   * Формат: "using Dat4T Version: V7.1.9"
   *
   * @param {string} line - Строка с версией
   * @returns {string} - Версия (например, "V7.1.9")
   */
  parseDat4TVersion(line) {
    const match = line.match(/Version:\s*(V[\d.]+)/i);
    if (match) {
      return match[1];
    }
    return 'Unknown';
  }

  /**
   * Парсит тип двигателя
   * Формат: "This is a Naturally Aspirated Spark Ignition Engine."
   *         "This is a Turbocharged Spark Ignition Engine."
   *         "This is a Supercharged Spark Ignition Engine."
   *
   * @param {string} line - Строка с типом двигателя
   * @returns {string} - "NA" | "Turbo" | "Supercharged"
   */
  parseEngineType(line) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('naturally aspirated')) {
      return 'NA';
    } else if (lowerLine.includes('turbocharged')) {
      return 'Turbo';
    } else if (lowerLine.includes('supercharged')) {
      return 'Supercharged';
    }

    return 'NA'; // Default
  }

  /**
   * Парсит конфигурацию двигателя
   * Формат: "The engine is an                          : INLINE TYPE"
   *         "The engine is an                          : VEE TYPE"
   *
   * @param {string} line - Строка с конфигурацией
   * @returns {string} - "inline" | "vee" | "unknown"
   */
  parseConfiguration(line) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('inline')) {
      return 'inline';
    } else if (lowerLine.includes('vee') || lowerLine.includes('v-type')) {
      return 'vee';
    }

    return 'unknown';
  }

  /**
   * Парсит intake system из секции INTAKE
   * Логика основана на точных строках из .prt файлов:
   *
   * 1. "collected intake pipes" → Carb (Carburetor/Collector - 4into1, 1intoN)
   * 2. "seperate intake pipes":
   *    - "with no airboxes" + "but with throttles" → ITB (Individual Throttle Bodies)
   *    - "with a common airbox or plenum" → IM (Intake Manifold)
   *
   * @param {string[]} intakeLines - Строки секции INTAKE system
   * @param {number} numCylinders - Количество цилиндров
   * @returns {string} - "ITB" | "IM" | "Carb"
   */
  parseIntakeSystem(intakeLines, numCylinders) {
    const intakeText = intakeLines.join('\n').toLowerCase();

    // 1. ПЕРВЫМ проверяем "collected intake pipes" → Carburetor/Collector
    if (intakeText.includes('collected intake pipes')) {
      return 'Carb';
    }

    // 2. Проверяем "seperate intake pipes"
    if (intakeText.includes('seperate intake pipes')) {
      // 2a. ITB: separate + no airboxes + throttles
      if (intakeText.includes('with no airboxes') && intakeText.includes('but with throttles')) {
        return 'ITB';
      }

      // 2b. IM: separate + common airbox/plenum
      if (intakeText.includes('with a common airbox') || intakeText.includes('with a common plenum')) {
        return 'IM';
      }
    }

    // Fallback: Дополнительная проверка по throttles count (для старых .prt файлов)
    const throttlesMatch = intakeText.match(/(\d+)\s+throttles/i);
    const airboxMatch = intakeText.match(/(\d+)\s+boxes\/plenums/i);

    if (throttlesMatch && airboxMatch) {
      const throttles = parseInt(throttlesMatch[1], 10);
      const airboxes = parseInt(airboxMatch[1], 10);

      if (throttles === numCylinders && airboxes === 0) {
        return 'ITB';
      }
    }

    // Default: IM
    return 'IM';
  }

  /**
   * Парсит exhaust system pattern из секции EXHAUST
   * Формат: "The exhaust system is a 4into2into1 manifold."
   * Преобразует: "4into2into1" → "4-2-1"
   *
   * @param {string[]} exhaustLines - Строки секции EXHAUST system
   * @returns {string} - "4-2-1" | "4-1" | "tri-y" | "8-4-2-1" | "unknown"
   */
  parseExhaustSystem(exhaustLines) {
    const exhaustText = exhaustLines.join('\n').toLowerCase();

    // Ищем паттерн: "4into2into1 manifold" или просто "4into2into1"
    const match = exhaustText.match(/(\d+into\d+(?:into\d+)?)\s+manifold/i);

    if (match) {
      const pattern = match[1];
      // Преобразуем: "4into2into1" → "4-2-1"
      const formatted = pattern.replace(/into/g, '-');
      return formatted;
    }

    // Особый случай: tri-y
    if (exhaustText.includes('tri-y') || exhaustText.includes('tri y')) {
      return 'tri-y';
    }

    return 'unknown';
  }

  /**
   * Парсит секцию "Ignition Model Data" из .prt файла
   * Формат секции (lines ~368-387):
   *   The Ignition model data:
   *   ------------------------
   *
   *   The Combustion Model uses Wiebe Curves for prescribed burn rate
   *   Type of Fuel          =    100 UNLEADED
   *   Nitromethane Ratio   =   0.000
   *
   *         Ignition, AFR and Combustion curves
   *
   *    RPM     Timing    AFR    Delay Duration  VibeA  VibeB  Beff
   *   2000.00   14.00   12.50    4.34   43.40   10.00  2.000  0.870
   *   ...
   *
   * @param {string[]} lines - Все строки файла
   * @param {number} startIndex - Индекс строки "The Ignition model data:"
   * @returns {Object|null} - Объект с combustion data или null
   */
  parseIgnitionModelData(lines, startIndex) {
    const result = {
      fuelType: null,
      nitromethaneRatio: null,
      curves: []
    };

    let inCurvesSection = false;
    let foundHeader = false;

    // Парсим от startIndex до конца секции (asterisks или конец файла)
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      // Конец секции: asterisks или следующая секция
      if (line.includes('*********') || line.includes('The wall temperature')) {
        break;
      }

      // Пропускаем пустые строки
      if (!line) {
        continue;
      }

      // 1. Извлекаем Type of Fuel
      if (line.includes('Type of Fuel') && !result.fuelType) {
        const match = line.match(/Type of Fuel\s*=\s*(.+)/i);
        if (match) {
          result.fuelType = match[1].trim();
        }
      }

      // 2. Извлекаем Nitromethane Ratio
      if (line.includes('Nitromethane Ratio') && result.nitromethaneRatio === null) {
        const match = line.match(/Nitromethane Ratio\s*=\s*([\d.]+)/i);
        if (match) {
          result.nitromethaneRatio = parseFloat(match[1]);
        }
      }

      // 3. Находим начало таблицы кривых
      if (line.includes('Ignition, AFR and Combustion curves')) {
        inCurvesSection = true;
        continue;
      }

      // 4. Пропускаем заголовок таблицы (RPM Timing AFR...)
      if (inCurvesSection && line.includes('RPM') && line.includes('Timing') && line.includes('AFR')) {
        foundHeader = true;
        continue;
      }

      // 5. Парсим строки таблицы (после заголовка)
      if (inCurvesSection && foundHeader) {
        // Формат строки: "2000.00   14.00   12.50    4.34   43.40   10.00  2.000  0.870"
        // Разделяем по пробелам и извлекаем числа
        const parts = line.split(/\s+/).filter(p => p.length > 0);

        // Проверяем что строка содержит 8 числовых значений
        if (parts.length >= 8 && /^[\d.]+$/.test(parts[0])) {
          const curve = {
            rpm: parseFloat(parts[0]),
            timing: parseFloat(parts[1]),      // °BTDC
            afr: parseFloat(parts[2]),
            delay: parseFloat(parts[3]),       // °
            duration: parseFloat(parts[4]),    // °
            vibeA: parseFloat(parts[5]),
            vibeB: parseFloat(parts[6]),
            beff: parseFloat(parts[7])
          };

          result.curves.push(curve);
        }
      }
    }

    // Валидация: проверяем что хоть что-то распарсили
    if (result.curves.length === 0) {
      console.warn('[PrtParser] Combustion curves table is empty');
      return null;
    }

    return result;
  }

  /**
   * Парсит .prt файл и возвращает метаданные двигателя
   *
   * @param {string} filePath - Путь к .prt файлу
   * @returns {Promise<Object>} - Объект с метаданными двигателя
   */
  async parse(filePath) {
    try {
      // Читаем файл
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Инициализируем результат
      const metadata = {
        prtFileName: basename(filePath),
        created: null,
        datVersion: null,
        engine: {
          name: null,
          cylinders: null,
          configuration: null,
          type: null, // NA, Turbo, Supercharged
          bore: null,
          stroke: null,
          displacement: null, // Engine displacement in liters (calculated from bore, stroke, cylinders)
          compressionRatio: null,
          maxPowerRPM: null,
          intakeSystem: null, // ITB, IM, Carb
          exhaustSystem: null, // 4-2-1, 4-1, tri-y, etc.
          valvesPerCylinder: null, // Total valves per cylinder (2, 3, 4, 5)
          inletValves: null, // Number of inlet valves per cylinder
          exhaustValves: null // Number of exhaust valves per cylinder
        },
        combustion: null // Ignition model data (v3.2.0)
      };

      // Парсим построчно, ищем ключевые данные
      let inIntakeSection = false;
      let inExhaustSection = false;
      let intakeSectionLines = [];
      let exhaustSectionLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Пропускаем пустые строки
        if (!line) {
          continue;
        }

        // 1. Project name (обычно line 8, но ищем паттерн)
        if (line.includes('engine') && !metadata.engine.name && i < 20) {
          metadata.engine.name = this.parseProjectName(line);
        }

        // 2. Creation date (lines 12-13)
        if (line.includes('constructed on:') && !metadata.created) {
          const dateLine = line;
          const timeLine = lines[i + 1] || '';
          metadata.created = this.parseCreationDate(dateLine, timeLine);
        }

        // 3. Dat4T version (line 15)
        if (line.includes('Dat4T Version:') && !metadata.datVersion) {
          metadata.datVersion = this.parseDat4TVersion(line);
        }

        // 4. Engine type (line ~36)
        if (line.includes('This is a') && (line.includes('Aspirated') || line.includes('charged'))) {
          metadata.engine.type = this.parseEngineType(line);
        }

        // 5. Number of cylinders (line ~38)
        if (line.includes('Number of cylinders') && !metadata.engine.cylinders) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.cylinders = parseInt(value, 10);
          }
        }

        // 6. Configuration (line ~39)
        if (line.includes('The engine is an') && line.includes('TYPE')) {
          metadata.engine.configuration = this.parseConfiguration(line);
        }

        // 7. Bore (line ~46)
        if (line.includes('Bore') && !line.includes('Bored') && !metadata.engine.bore) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.bore = parseFloat(value);
          }
        }

        // 8. Stroke (line ~47)
        if (line.includes('Stroke') && !metadata.engine.stroke) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.stroke = parseFloat(value);
          }
        }

        // 9. Compression Ratio (line ~50)
        if (line.includes('Geometric Compression Ratio') && !metadata.engine.compressionRatio) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.compressionRatio = parseFloat(value);
          }
        }

        // 10. Max Power RPM (line ~55)
        if (line.includes('RPM for Maximum Power') && !metadata.engine.maxPowerRPM) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.maxPowerRPM = parseFloat(value);
          }
        }

        // 11. Valves per cylinder (line ~44)
        // Формат: "The Cylinder head is of Tumble Flow type with 4 valves"
        if (line.includes('Cylinder head') && line.includes('valves') && !metadata.engine.valvesPerCylinder) {
          const match = line.match(/with\s+(\d+)\s+valves/i);
          if (match) {
            metadata.engine.valvesPerCylinder = parseInt(match[1], 10);
          }
        }

        // 12. Number of exhaust valves (in EXHAUST section, line ~73)
        if (line.includes('Number of exhaust valves') && !metadata.engine.exhaustValves) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.exhaustValves = parseInt(value, 10);
          }
        }

        // 13. Number of inlet valves (in INLET section, line ~140)
        if (line.includes('Number of inlet valves') && !metadata.engine.inletValves) {
          const value = this.extractValue(line);
          if (value) {
            metadata.engine.inletValves = parseInt(value, 10);
          }
        }

        // 14. Intake system section
        if (line.includes('The INTAKE system has the following Characteristics')) {
          inIntakeSection = true;
          inExhaustSection = false;
          intakeSectionLines = [];
        } else if (inIntakeSection) {
          if (line.includes('*********') || line.includes('The Ignition model')) {
            // Конец intake секции
            inIntakeSection = false;
            if (!metadata.engine.intakeSystem && metadata.engine.cylinders) {
              metadata.engine.intakeSystem = this.parseIntakeSystem(
                intakeSectionLines,
                metadata.engine.cylinders
              );
            }
          } else {
            intakeSectionLines.push(line);
          }
        }

        // 15. Ignition Model Data section (v3.2.0)
        if (line.includes('The Ignition model data:') && !metadata.combustion) {
          metadata.combustion = this.parseIgnitionModelData(lines, i);
        }

        // 12. Exhaust system section
        if (line.includes('The EXHAUST system has the following Characteristics')) {
          inExhaustSection = true;
          inIntakeSection = false;
          exhaustSectionLines = [];
        } else if (inExhaustSection) {
          if (line.includes('*********') || line.includes('The INTAKE system')) {
            // Конец exhaust секции
            inExhaustSection = false;
            if (!metadata.engine.exhaustSystem) {
              metadata.engine.exhaustSystem = this.parseExhaustSystem(exhaustSectionLines);
            }
          } else {
            exhaustSectionLines.push(line);
          }
        }
      }

      // Финальная проверка: если intake/exhaust не найдены, парсим из накопленных строк
      if (!metadata.engine.intakeSystem && intakeSectionLines.length > 0 && metadata.engine.cylinders) {
        metadata.engine.intakeSystem = this.parseIntakeSystem(
          intakeSectionLines,
          metadata.engine.cylinders
        );
      }

      if (!metadata.engine.exhaustSystem && exhaustSectionLines.length > 0) {
        metadata.engine.exhaustSystem = this.parseExhaustSystem(exhaustSectionLines);
      }

      // Валидация: проверяем что основные поля заполнены
      if (!metadata.engine.name) {
        console.warn(`[PrtParser] Не удалось извлечь название проекта из ${filePath}`);
      }

      if (!metadata.engine.cylinders) {
        console.warn(`[PrtParser] Не удалось извлечь количество цилиндров из ${filePath}`);
      }

      // Рассчитываем displacement (объем двигателя) в литрах
      // Формула: displacement = π/4 × bore² × stroke × cylinders / 1000000
      // bore и stroke в мм, результат в литрах
      if (metadata.engine.bore && metadata.engine.stroke && metadata.engine.cylinders) {
        const bore = metadata.engine.bore; // мм
        const stroke = metadata.engine.stroke; // мм
        const cylinders = metadata.engine.cylinders;

        // Объем одного цилиндра в мм³: π/4 × bore² × stroke
        // Затем переводим в литры: мм³ → см³ (÷1000) → литры (÷1000) = ÷1000000
        const displacementLiters = (Math.PI / 4) * Math.pow(bore, 2) * stroke * cylinders / 1000000;

        // Округляем до 2 знаков после запятой
        metadata.engine.displacement = Math.round(displacementLiters * 100) / 100;
      }

      console.log(`[PrtParser] Успешно распарсен файл: ${basename(filePath)}`);
      console.log(`[PrtParser] Engine: ${metadata.engine.name}, Type: ${metadata.engine.type}, ` +
                  `${metadata.engine.displacement ? metadata.engine.displacement + 'L, ' : ''}` +
                  `Intake: ${metadata.engine.intakeSystem}, ` +
                  `Valves: ${metadata.engine.valvesPerCylinder} (${metadata.engine.inletValves} In + ${metadata.engine.exhaustValves} Ex)`);

      if (metadata.combustion) {
        console.log(`[PrtParser] Combustion: ${metadata.combustion.fuelType}, ` +
                    `${metadata.combustion.curves.length} RPM points, ` +
                    `Timing range: ${metadata.combustion.curves[0].timing}° - ${metadata.combustion.curves[metadata.combustion.curves.length - 1].timing}° BTDC`);
      }

      return metadata;

    } catch (error) {
      console.error(`[PrtParser] Ошибка при парсинге файла ${filePath}:`, error);
      throw error;
    }
  }
}

export { PrtParser };
