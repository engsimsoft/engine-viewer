/**
 * Парсер .det файлов двигателей
 *
 * Структура .det файла:
 * - Строка 1: Метаданные (NumCylinders EngineType)
 * - Строка 2: Заголовки колонок
 * - Строка 3+: Данные расчетов
 *   - Строки с $N - маркеры расчетов ($1, $2, $3.1, и т.д.)
 *   - После каждого маркера - строки с числовыми данными
 *
 * ВАЖНО: Первая колонка - служебная (номер строки с символом →)
 * Данные начинаются со ВТОРОЙ колонки!
 */

import { readFile, readdir } from 'fs/promises';
import { basename, join, parse } from 'path';

/**
 * Парсит метаданные из первой строки файла
 * Формат: "    NumCylinders  EngineType    AdditionalInfo"
 * Пример: "           4 NATUR     NumCyl"
 *
 * @param {string} line - Первая строка файла
 * @returns {Object} - Метаданные двигателя
 */
function parseMetadata(line) {
  // Удаляем номер строки (если есть) и символ →
  const cleanLine = line.replace(/^\s*\d+→/, '').trim();

  // Разбиваем по пробелам и фильтруем пустые элементы
  const parts = cleanLine.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    throw new Error('Некорректный формат метаданных в первой строке');
  }

  return {
    numCylinders: parseInt(parts[0], 10),
    engineType: parts[1]
  };
}

/**
 * Парсит заголовки колонок из второй строки файла
 * Формат: "     RPM        P-Av       Torque    PurCyl( 1)  PurCyl( 2) ..."
 *
 * @param {string} line - Вторая строка файла
 * @returns {string[]} - Массив заголовков колонок
 */
function parseColumnHeaders(line) {
  // Удаляем номер строки и символ →
  const cleanLine = line.replace(/^\s*\d+→/, '').trim();

  // Разбиваем по пробелам (учитываем множественные пробелы)
  const headers = cleanLine.split(/\s+/).filter(Boolean);

  return headers;
}

/**
 * Парсит одну строку данных
 * Формат: "     4→     2600       33.69      123.73      0.8898      0.8898 ..."
 *
 * @param {string} line - Строка с данными
 * @param {string[]} headers - Заголовки колонок
 * @param {number} numCylinders - Количество цилиндров
 * @returns {Object|null} - Объект DataPoint или null если строка пустая
 */
function parseDataLine(line, headers, numCylinders) {
  // Удаляем номер строки и символ →
  const cleanLine = line.replace(/^\s*\d+→/, '').trim();

  // Если строка пустая или содержит только маркер расчета
  if (!cleanLine || cleanLine.startsWith('$')) {
    return null;
  }

  // Разбиваем по пробелам
  const values = cleanLine.split(/\s+/).filter(Boolean);

  // Проверяем что количество значений соответствует заголовкам
  if (values.length !== headers.length) {
    console.warn(`Несоответствие количества значений (${values.length}) и заголовков (${headers.length})`);
    console.warn(`Line: ${cleanLine}`);
  }

  // Создаем объект DataPoint
  const dataPoint = {
    RPM: parseFloat(values[0]),
    'P-Av': parseFloat(values[1]),
    Torque: parseFloat(values[2]),
    PurCyl: [],
    TUbMax: [],
    TCylMax: [],
    PCylMax: [],
    Deto: [],
    Convergence: 0
  };

  // Парсим данные по цилиндрам
  // PurCyl: колонки 3-6 (для 4 цилиндров)
  // TUbMax: колонки 7-10
  // TCylMax: колонки 11-14
  // PCylMax: колонки 15-18
  // Deto: колонки 19-22
  // Convergence: колонка 23

  let currentIndex = 3; // Начинаем после RPM, P-Av, Torque

  // PurCyl (коэффициент наполнения)
  for (let i = 0; i < numCylinders; i++) {
    dataPoint.PurCyl.push(parseFloat(values[currentIndex++]));
  }

  // TUbMax (температура выпускных газов)
  for (let i = 0; i < numCylinders; i++) {
    dataPoint.TUbMax.push(parseFloat(values[currentIndex++]));
  }

  // TCylMax (температура в цилиндре)
  for (let i = 0; i < numCylinders; i++) {
    dataPoint.TCylMax.push(parseFloat(values[currentIndex++]));
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
 * Извлекает ID расчета из строки маркера
 *
 * ВАЖНО: Символ $ - это технический маркер, который backend программы расчётов
 * автоматически добавляет в файл. После $ идёт текст, который ввёл пользователь.
 *
 * Примеры:
 *   Файл: "$1"           → id: "$1",           name: "1"
 *   Файл: "$3.1"         → id: "$3.1",         name: "3.1"
 *   Файл: "$3.1 R 0.86"  → id: "$3.1 R 0.86",  name: "3.1 R 0.86"
 *   Файл: "$baseline"    → id: "$baseline",    name: "baseline"
 *
 * @param {string} line - Строка с маркером расчета
 * @returns {Object} - { id: string (с $), name: string (без $) }
 */
function parseCalculationMarker(line) {
  // Удаляем номер строки и символ →
  const cleanLine = line.replace(/^\s*\d+→/, '').trim();

  // Проверяем что строка начинается с $
  if (!cleanLine.startsWith('$')) {
    throw new Error(`Некорректный формат маркера расчета (ожидается $): ${line}`);
  }

  // Всё после $ (включая пробелы) - это название, которое ввёл пользователь
  const fullId = cleanLine.trim();           // "$3.1 R 0.86"
  const userInputName = fullId.substring(1).trim();  // "3.1 R 0.86" (убираем $)

  return {
    id: fullId,              // Полный ID с $ для внутреннего использования
    name: userInputName      // Название без $ для отображения в UI
  };
}

/**
 * Парсит .det файл и возвращает структурированные данные
 *
 * @param {string} filePath - Путь к .det файлу
 * @returns {Promise<Object>} - Объект EngineProject
 */
async function parseDetFile(filePath) {
  try {
    // Читаем файл
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lines.length < 3) {
      throw new Error('Файл слишком короткий, должен содержать минимум 3 строки');
    }

    // Парсим метаданные (строка 1)
    const metadata = parseMetadata(lines[0]);

    // Парсим заголовки (строка 2)
    const columnHeaders = parseColumnHeaders(lines[1]);

    // Парсим расчеты (строка 3+)
    const calculations = [];
    let currentCalculation = null;

    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];

      // Пропускаем пустые строки
      if (!line.trim()) {
        continue;
      }

      // Проверяем, является ли строка маркером расчета
      const cleanLine = line.replace(/^\s*\d+→/, '').trim();

      if (cleanLine.startsWith('$')) {
        // Сохраняем предыдущий расчет (если был)
        if (currentCalculation && currentCalculation.dataPoints.length > 0) {
          calculations.push(currentCalculation);
        }

        // Начинаем новый расчет
        const { id, name } = parseCalculationMarker(line);
        currentCalculation = {
          id,
          name,
          dataPoints: []
        };
      } else if (currentCalculation) {
        // Парсим строку данных
        const dataPoint = parseDataLine(line, columnHeaders, metadata.numCylinders);

        if (dataPoint) {
          currentCalculation.dataPoints.push(dataPoint);
        }
      }
    }

    // Добавляем последний расчет
    if (currentCalculation && currentCalculation.dataPoints.length > 0) {
      calculations.push(currentCalculation);
    }

    // Формируем результат
    const result = {
      fileName: basename(filePath),
      metadata,
      columnHeaders,
      calculations
    };

    return result;
  } catch (error) {
    console.error(`Ошибка при парсинге файла ${filePath}:`, error);
    throw error;
  }
}

/**
 * Получает список всех .det файлов в директории
 *
 * @param {string} directoryPath - Путь к директории
 * @returns {Promise<string[]>} - Массив путей к .det файлам
 */
async function getDetFiles(directoryPath) {
  try {
    const files = await readdir(directoryPath);

    const detFiles = files
      .filter(file => file.toLowerCase().endsWith('.det'))
      .map(file => join(directoryPath, file));

    return detFiles;
  } catch (error) {
    console.error(`Ошибка при чтении директории ${directoryPath}:`, error);
    throw error;
  }
}

/**
 * Парсит все .det файлы в директории
 *
 * @param {string} directoryPath - Путь к директории
 * @returns {Promise<Object[]>} - Массив объектов EngineProject
 */
async function parseAllDetFiles(directoryPath) {
  try {
    const detFiles = await getDetFiles(directoryPath);

    const projects = await Promise.all(
      detFiles.map(filePath => parseDetFile(filePath))
    );

    return projects;
  } catch (error) {
    console.error('Ошибка при парсинге .det файлов:', error);
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
