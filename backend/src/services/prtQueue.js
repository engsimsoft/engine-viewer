/**
 * PRT Parsing Queue Service
 *
 * Управление очередью парсинга .prt файлов с ограничением concurrency.
 * Защита от race conditions и избыточной нагрузки при запуске.
 *
 * Ключевые возможности:
 * - Concurrency limit (max 3 файла одновременно)
 * - Priority queue (high/low priority)
 * - Deduplication (один projectId не добавляется дважды)
 * - Progress tracking (total, pending, completed)
 * - Event emitter для уведомлений о прогрессе
 */

import PQueue from 'p-queue';
import { EventEmitter } from 'events';
import { normalizeFilenameToId } from './fileScanner.js';

/**
 * Класс для управления очередью парсинга .prt файлов
 * @extends EventEmitter
 */
export class PrtParsingQueue extends EventEmitter {
  /**
   * Создаёт новую очередь парсинга
   * @param {Object} options - Опции очереди
   * @param {number} [options.concurrency=3] - Максимальное количество одновременных парсингов
   */
  constructor(options = {}) {
    super();

    // Создаём очередь с ограничением concurrency
    this.queue = new PQueue({
      concurrency: options.concurrency || 3
    });

    // Tracking sets
    this.pending = new Set(); // projectIds в очереди или обрабатываемые
    this.completed = new Set(); // projectIds успешно обработанные
    this.total = 0; // Общее количество добавленных задач

    console.log(`[Queue] Initialized with concurrency: ${options.concurrency || 3}`);
  }

  /**
   * Добавляет .prt файл в очередь для парсинга
   * @param {Object} file - FileInfo объект с полями { name, path, size, mtime }
   * @param {Function} parseFn - Функция парсинга (обычно parsePrtFileAndUpdateMetadata)
   * @param {'high' | 'low'} [priority='low'] - Приоритет задачи
   * @returns {Promise<void>}
   */
  async addToQueue(file, parseFn, priority = 'low') {
    const projectId = normalizeFilenameToId(file.name);

    // Дедупликация: если файл уже в очереди, пропускаем
    if (this.pending.has(projectId)) {
      console.log(`[Queue] Skip duplicate: ${file.name}`);
      return;
    }

    // Добавляем в pending сразу (до добавления в очередь)
    this.pending.add(projectId);
    this.total++;

    // Определяем priority для p-queue (higher number = higher priority)
    const queueOptions = priority === 'high' ? { priority: 10 } : { priority: 1 };

    console.log(`[Queue] Added to queue: ${file.name} (priority: ${priority})`);

    // Добавляем задачу в очередь
    await this.queue.add(async () => {
      try {
        console.log(`[Queue] Processing: ${file.name} (${this.completed.size + 1}/${this.total})`);

        // Выполняем парсинг
        const result = await parseFn(file);

        // Отмечаем как выполненный
        this.pending.delete(projectId);
        this.completed.add(projectId);

        console.log(`[Queue] Completed: ${file.name} (${this.completed.size}/${this.total})`);

        // Испускаем событие прогресса
        this.emit('progress', this.getStatus());

        // Если всё обработано, испускаем событие завершения
        if (this.pending.size === 0) {
          this.emit('idle', this.getStatus());
        }

        return result;
      } catch (error) {
        console.error(`[Queue] Error processing ${file.name}:`, error.message);

        // Удаляем из pending даже при ошибке
        this.pending.delete(projectId);

        // Испускаем событие ошибки
        this.emit('error', { projectId, file, error });

        // Испускаем событие прогресса
        this.emit('progress', this.getStatus());

        return null;
      }
    }, queueOptions);
  }

  /**
   * Проверяет, находится ли проект в очереди или обрабатывается
   * @param {string} projectId - ID проекта (normalized filename)
   * @returns {boolean} - true если в очереди/обрабатывается
   */
  isPending(projectId) {
    return this.pending.has(projectId);
  }

  /**
   * Проверяет, обработан ли проект
   * @param {string} projectId - ID проекта (normalized filename)
   * @returns {boolean} - true если обработан
   */
  isCompleted(projectId) {
    return this.completed.has(projectId);
  }

  /**
   * Возвращает текущий статус очереди
   * @returns {Object} - { total, pending, completed, isProcessing }
   */
  getStatus() {
    return {
      total: this.total,
      pending: this.pending.size,
      completed: this.completed.size,
      isProcessing: this.pending.size > 0
    };
  }

  /**
   * Очищает состояние очереди (для тестов или перезапуска)
   */
  reset() {
    this.pending.clear();
    this.completed.clear();
    this.total = 0;
    console.log('[Queue] Reset completed');
  }

  /**
   * Ожидает завершения всех задач в очереди
   * @returns {Promise<void>}
   */
  async onIdle() {
    await this.queue.onIdle();
  }
}

/**
 * Singleton инстанс очереди для глобального использования
 * Используется в server.js для интеграции с File Watcher и Scanner
 */
let globalQueueInstance = null;

/**
 * Получает или создаёт глобальный экземпляр очереди
 * @param {Object} [options] - Опции очереди (используются только при первом создании)
 * @returns {PrtParsingQueue}
 */
export function getGlobalQueue(options = {}) {
  if (!globalQueueInstance) {
    globalQueueInstance = new PrtParsingQueue(options);
  }
  return globalQueueInstance;
}

/**
 * Сбрасывает глобальный экземпляр (для тестов)
 */
export function resetGlobalQueue() {
  if (globalQueueInstance) {
    globalQueueInstance.reset();
  }
  globalQueueInstance = null;
}
