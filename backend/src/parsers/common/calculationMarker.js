/**
 * Универсальная функция для парсинга маркеров расчётов ($)
 * Работает для всех форматов файлов (.det, .pou, и будущих)
 *
 * ВАЖНО: Символ $ - технический маркер, который backend программы расчётов
 * автоматически добавляет в файл. После $ идёт текст, который ввёл пользователь.
 *
 * Примеры:
 *   Файл: "$1"           → id: "$1",           name: "1"
 *   Файл: "$3.1"         → id: "$3.1",         name: "3.1"
 *   Файл: "$3.1 R 0.86"  → id: "$3.1 R 0.86",  name: "3.1 R 0.86"
 *   Файл: "$baseline"    → id: "$baseline",    name: "baseline"
 *   Файл: "$Cal_1"       → id: "$Cal_1",       name: "Cal_1"
 */

/**
 * Удаляет номер строки и символ → из начала строки
 * @param {string} line - Строка из файла
 * @returns {string} - Очищенная строка
 */
function cleanLine(line) {
  return line.replace(/^\s*\d+→/, '').trim();
}

/**
 * Проверяет, является ли строка маркером расчёта
 * @param {string} line - Строка из файла
 * @returns {boolean} - true если строка начинается с $
 */
function isCalculationMarker(line) {
  const cleaned = cleanLine(line);
  return cleaned.startsWith('$');
}

/**
 * Парсит маркер расчёта и извлекает ID и название
 *
 * @param {string} line - Строка с маркером расчёта
 * @returns {Object} - { id: string (с $), name: string (без $) }
 * @throws {Error} - Если строка не является корректным маркером
 */
function parseCalculationMarker(line) {
  const cleaned = cleanLine(line);

  // Проверяем что строка начинается с $
  if (!cleaned.startsWith('$')) {
    throw new Error(`Некорректный формат маркера расчёта (ожидается $): ${line}`);
  }

  // Всё после $ (включая пробелы) - это название, которое ввёл пользователь
  const fullId = cleaned.trim();                    // "$3.1 R 0.86" или "$Cal_1"
  const userInputName = fullId.substring(1).trim(); // "3.1 R 0.86" или "Cal_1"

  return {
    id: fullId,              // Полный ID с $ для внутреннего использования
    name: userInputName      // Название без $ для отображения в UI
  };
}

export {
  cleanLine,
  isCalculationMarker,
  parseCalculationMarker
};
