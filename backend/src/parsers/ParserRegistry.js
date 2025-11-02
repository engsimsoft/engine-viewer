/**
 * Реестр парсеров для различных форматов файлов двигателей
 *
 * Паттерн Registry позволяет:
 * - Регистрировать парсеры для новых форматов
 * - Получать парсер по формату файла
 * - Легко добавлять поддержку новых форматов в будущем
 *
 * Пример использования:
 *   import { ParserRegistry } from './ParserRegistry.js';
 *   import { DetParser } from './formats/detParser.js';
 *   import { PouParser } from './formats/pouParser.js';
 *
 *   const registry = new ParserRegistry();
 *   registry.register('det', DetParser);
 *   registry.register('pou', PouParser);
 *
 *   const parser = registry.getParser('det');
 *   const data = await parser.parse(filePath);
 */

class ParserRegistry {
  constructor() {
    /**
     * Карта зарегистрированных парсеров
     * Ключ: формат файла ('det', 'pou', и т.д.)
     * Значение: класс парсера
     * @type {Map<string, Function>}
     */
    this.parsers = new Map();
  }

  /**
   * Регистрирует парсер для указанного формата
   *
   * @param {string} format - Формат файла ('det', 'pou', и т.д.)
   * @param {Function} ParserClass - Класс парсера (должен иметь метод parse)
   * @throws {Error} - Если формат уже зарегистрирован
   */
  register(format, ParserClass) {
    if (this.parsers.has(format)) {
      throw new Error(`Парсер для формата "${format}" уже зарегистрирован`);
    }

    // Проверяем что ParserClass имеет метод parse
    const instance = new ParserClass();
    if (typeof instance.parse !== 'function') {
      throw new Error(
        `Класс парсера для формата "${format}" должен иметь метод parse()`
      );
    }

    this.parsers.set(format, ParserClass);
    console.log(`✓ Парсер для формата "${format}" зарегистрирован`);
  }

  /**
   * Получает парсер для указанного формата
   *
   * @param {string} format - Формат файла ('det', 'pou', и т.д.)
   * @returns {Object} - Экземпляр парсера
   * @throws {Error} - Если парсер для формата не зарегистрирован
   */
  getParser(format) {
    if (!this.parsers.has(format)) {
      const supportedFormats = Array.from(this.parsers.keys()).join(', ');
      throw new Error(
        `Парсер для формата "${format}" не зарегистрирован. ` +
        `Поддерживаемые форматы: ${supportedFormats}`
      );
    }

    const ParserClass = this.parsers.get(format);
    return new ParserClass();
  }

  /**
   * Проверяет, зарегистрирован ли парсер для указанного формата
   *
   * @param {string} format - Формат файла
   * @returns {boolean} - true если парсер зарегистрирован
   */
  hasParser(format) {
    return this.parsers.has(format);
  }

  /**
   * Возвращает список всех поддерживаемых форматов
   *
   * @returns {string[]} - Массив форматов
   */
  getSupportedFormats() {
    return Array.from(this.parsers.keys());
  }

  /**
   * Удаляет регистрацию парсера для указанного формата
   * (используется в основном для тестирования)
   *
   * @param {string} format - Формат файла
   * @returns {boolean} - true если парсер был удалён
   */
  unregister(format) {
    return this.parsers.delete(format);
  }

  /**
   * Очищает все зарегистрированные парсеры
   * (используется в основном для тестирования)
   */
  clear() {
    this.parsers.clear();
  }
}

// Создаём глобальный экземпляр реестра (Singleton pattern)
const globalRegistry = new ParserRegistry();

export {
  ParserRegistry,
  globalRegistry
};
