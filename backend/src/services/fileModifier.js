/**
 * File Modifier Service
 *
 * Безопасная модификация файлов .det/.pou:
 * - Переименование расчётов (маркеров $)
 * - Удаление расчётов
 *
 * КРИТИЧЕСКИ ВАЖНО: 100% безопасность - atomic write pattern с backup и validation
 *
 * Architecture Decision Record: см. docs/decisions/
 */

import { readFile, writeFile, rename, unlink, access } from 'fs/promises';
import { dirname, basename, extname } from 'path';
import { isCalculationMarker, parseCalculationMarker } from '../parsers/common/calculationMarker.js';

/**
 * Валидация ID маркера расчёта
 *
 * Правила:
 * - Должен начинаться с $
 * - Не может быть пустым (только "$")
 * - Не может содержать табы или переносы строк
 * - Длина не более 100 символов
 *
 * @param {string} markerId - ID маркера для проверки
 * @returns {string|null} - null если валидно, иначе сообщение об ошибке
 */
function validateMarkerId(markerId) {
  if (typeof markerId !== 'string') {
    return 'Marker ID must be a string';
  }

  if (!markerId.startsWith('$')) {
    return 'Marker ID must start with $';
  }

  if (markerId === '$') {
    return 'Marker ID cannot be empty (just "$")';
  }

  if (markerId.includes('\t') || markerId.includes('\n') || markerId.includes('\r')) {
    return 'Marker ID cannot contain tabs or newlines';
  }

  if (markerId.length > 100) {
    return 'Marker ID too long (max 100 characters)';
  }

  return null; // Валидно
}

/**
 * Валидация изменённого файла через существующие парсеры
 *
 * Критическая проверка перед заменой оригинального файла:
 * - Файл должен корректно парситься
 * - Должна быть корректная структура (metadata + calculations)
 * - Должен содержать хотя бы 1 расчёт
 *
 * @param {string} tmpPath - Путь к временному файлу для валидации
 * @param {string} ext - Расширение файла ('.det' или '.pou')
 * @returns {Promise<void>}
 * @throws {Error} - Если файл невалидный
 */
async function validateModifiedFile(tmpPath, ext) {
  try {
    // Динамический импорт нужного парсера
    let ParserClass;

    if (ext === '.det') {
      const module = await import('../parsers/formats/detParser.js');
      ParserClass = module.DetParser;
    } else if (ext === '.pou') {
      const module = await import('../parsers/formats/pouParser.js');
      ParserClass = module.PouParser;
    } else {
      throw new Error(`Unsupported file extension: ${ext}`);
    }

    // Создаём экземпляр парсера и парсим файл
    const parser = new ParserClass();
    const parsed = await parser.parse(tmpPath);

    // Дополнительные проверки структуры
    if (!parsed.metadata || !parsed.calculations) {
      throw new Error('Invalid file structure after modification: missing metadata or calculations');
    }

    if (!Array.isArray(parsed.calculations) || parsed.calculations.length === 0) {
      throw new Error('File has no calculations after modification');
    }

    console.log(`[FileModifier] Validation passed: ${parsed.calculations.length} calculations found`);

  } catch (error) {
    throw new Error(`File validation failed: ${error.message}`);
  }
}

/**
 * Безопасная запись файла с использованием Atomic Write Pattern
 *
 * Гарантии:
 * 1. Файл либо полностью перезаписан, либо не тронут
 * 2. Backup создаётся ДО замены оригинала
 * 3. Validation ДО замены оригинала
 * 4. Rollback при любой ошибке
 *
 * Алгоритм:
 * 1. Read original → lines[]
 * 2. Apply modification via modifyFn()
 * 3. Write to .tmp
 * 4. Validate .tmp through parser
 * 5. Atomic replace: original → .backup, .tmp → original
 * 6. Rollback on error
 *
 * @param {string} filePath - Путь к файлу для изменения
 * @param {Function} modifyFn - Функция модификации: (lines[]) => modifiedLines[]
 * @returns {Promise<Object>} - { success: true, backupPath, linesModified }
 * @throws {Error} - При любых ошибках (с rollback)
 */
async function safeFileWrite(filePath, modifyFn) {
  const dir = dirname(filePath);
  const fileName = basename(filePath);
  const ext = extname(filePath);

  const tmpPath = `${filePath}.tmp`;
  const backupPath = `${filePath}.backup`;

  let backupCreated = false;
  let tmpCreated = false;

  try {
    // STEP 1: Читаем оригинальный файл
    console.log(`[FileModifier] Reading original file: ${filePath}`);
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    console.log(`[FileModifier] Original file: ${lines.length} lines`);

    // STEP 2: Применяем модификацию
    console.log(`[FileModifier] Applying modification...`);
    const modifiedLines = await modifyFn(lines);

    if (!Array.isArray(modifiedLines)) {
      throw new Error('modifyFn must return array of lines');
    }

    console.log(`[FileModifier] Modified file: ${modifiedLines.length} lines`);

    // STEP 3: Записываем во временный файл
    const modifiedContent = modifiedLines.join('\n');
    await writeFile(tmpPath, modifiedContent, 'utf-8');
    tmpCreated = true;

    console.log(`[FileModifier] Temporary file created: ${tmpPath}`);

    // STEP 4: КРИТИЧЕСКАЯ ВАЛИДАЦИЯ - парсим временный файл
    console.log(`[FileModifier] Validating modified file...`);
    await validateModifiedFile(tmpPath, ext);

    console.log(`[FileModifier] Validation passed ✓`);

    // STEP 5: Atomic replace (backup → tmp → original)
    // 5.1: Переименовываем оригинал в backup
    await rename(filePath, backupPath);
    backupCreated = true;
    console.log(`[FileModifier] Original backed up: ${backupPath}`);

    // 5.2: Переименовываем tmp в оригинал
    await rename(tmpPath, filePath);
    tmpCreated = false; // tmp больше не существует

    console.log(`[FileModifier] File successfully replaced ✓`);

    // STEP 6: Возвращаем результат
    return {
      success: true,
      backupPath: backupPath,
      linesModified: Math.abs(modifiedLines.length - lines.length)
    };

  } catch (error) {
    console.error(`[FileModifier] Error during file modification:`, error.message);

    // ROLLBACK: Удаляем tmp файл если он был создан
    if (tmpCreated) {
      try {
        await unlink(tmpPath);
        console.log(`[FileModifier] Cleaned up temporary file after error`);
      } catch (cleanupError) {
        console.warn(`[FileModifier] Failed to cleanup tmp file:`, cleanupError.message);
      }
    }

    // ROLLBACK: Восстанавливаем из backup если он был создан
    if (backupCreated) {
      try {
        await rename(backupPath, filePath);
        console.log(`[FileModifier] Restored from backup after error ✓`);
      } catch (restoreError) {
        console.error(`[FileModifier] CRITICAL: Failed to restore from backup!`, restoreError.message);
        throw new Error(
          `File modification failed AND backup restore failed! ` +
          `Original file may be in backup: ${backupPath}. ` +
          `Error: ${error.message}`
        );
      }
    }

    throw error;
  }
}

/**
 * Переименование расчёта (маркера)
 *
 * Изменяет маркер расчёта в файле: $3.1 R 0.86 → $baseline
 *
 * Алгоритм:
 * 1. Находит строку с маркером через isCalculationMarker()
 * 2. Заменяет маркер на новый
 * 3. Сохраняет форматирование строки (пробелы, табы)
 * 4. Проверяет уникальность нового ID
 *
 * @param {string} filePath - Путь к файлу .det/.pou
 * @param {string} oldMarkerId - Текущий ID маркера (например, "$3.1 R 0.86")
 * @param {string} newMarkerId - Новый ID маркера (например, "$baseline")
 * @returns {Promise<Object>} - Результат операции с backupPath
 * @throws {Error} - Если маркер не найден или новый ID уже существует
 */
async function renameCalculation(filePath, oldMarkerId, newMarkerId) {
  // Валидация нового ID
  const validationError = validateMarkerId(newMarkerId);
  if (validationError) {
    throw new Error(`Invalid new marker ID: ${validationError}`);
  }

  return await safeFileWrite(filePath, (lines) => {
    let modified = false;
    let markerFound = false;
    const existingIds = new Set();

    // Первый проход: собираем существующие ID и проверяем что oldMarkerId существует
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (isCalculationMarker(line)) {
        const { id } = parseCalculationMarker(line);
        existingIds.add(id);

        if (id === oldMarkerId) {
          markerFound = true;
        }
      }
    }

    // Проверяем что oldMarkerId найден
    if (!markerFound) {
      throw new Error(`Calculation "${oldMarkerId}" not found in file`);
    }

    // Проверяем что newMarkerId не существует (если он отличается от old)
    if (oldMarkerId !== newMarkerId && existingIds.has(newMarkerId)) {
      throw new Error(`Calculation with ID "${newMarkerId}" already exists`);
    }

    // Второй проход: заменяем маркер
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (isCalculationMarker(line)) {
        const { id: currentMarkerId } = parseCalculationMarker(line);

        if (currentMarkerId === oldMarkerId) {
          // Заменяем маркер, сохраняя форматирование строки
          // Ищем позицию $ в строке (может быть пробелы/табы в начале)
          const dollarIndex = line.indexOf('$');

          if (dollarIndex !== -1) {
            // Сохраняем префикс (пробелы/табы до $)
            const prefix = line.substring(0, dollarIndex);

            // Ищем где заканчивается маркер (следующий пробел/таб или конец строки)
            let markerEnd = dollarIndex;
            while (markerEnd < line.length &&
                   line[markerEnd] !== ' ' &&
                   line[markerEnd] !== '\t') {
              markerEnd++;
            }

            // Если после маркера есть пробелы - продолжаем их искать
            while (markerEnd < line.length &&
                   (line[markerEnd] === ' ' || line[markerEnd] === '\t')) {
              markerEnd++;
            }

            // Сохраняем суффикс (всё после маркера)
            const suffix = line.substring(markerEnd);

            // Формируем новую строку
            lines[i] = prefix + newMarkerId + (suffix ? ' ' + suffix : '');
            modified = true;

            console.log(`[FileModifier] Renamed: "${oldMarkerId}" → "${newMarkerId}"`);
          } else {
            // Fallback: простая замена (не должно произойти, но на всякий случай)
            lines[i] = line.replace(oldMarkerId, newMarkerId);
            modified = true;
          }

          break; // Маркеры уникальны, можно выходить
        }
      }
    }

    if (!modified) {
      throw new Error(`Failed to rename calculation "${oldMarkerId}"`);
    }

    return lines;
  });
}

/**
 * Удаление расчёта
 *
 * Полностью удаляет расчёт из файла:
 * - Строку с маркером ($)
 * - Все строки данных до следующего маркера или конца файла
 *
 * Алгоритм:
 * 1. Находит строку с маркером
 * 2. Удаляет эту строку + все следующие до:
 *    - Следующего маркера ($), ИЛИ
 *    - Конца файла
 * 3. Проверяет что это не последний расчёт (должен остаться хотя бы 1)
 *
 * @param {string} filePath - Путь к файлу .det/.pou
 * @param {string} calculationId - ID расчёта для удаления (например, "$2")
 * @returns {Promise<Object>} - Результат операции с backupPath и linesDeleted
 * @throws {Error} - Если расчёт не найден или это последний расчёт
 */
async function deleteCalculation(filePath, calculationId) {
  return await safeFileWrite(filePath, (lines) => {
    let deleteStart = -1;
    let deleteEnd = -1;
    let totalCalculations = 0;

    // PHASE 1: Подсчитываем общее количество расчётов
    for (let i = 0; i < lines.length; i++) {
      if (isCalculationMarker(lines[i])) {
        totalCalculations++;
      }
    }

    // Проверяем что это не последний расчёт
    if (totalCalculations <= 1) {
      throw new Error(
        'Cannot delete the last calculation in file. ' +
        'File must contain at least one calculation.'
      );
    }

    // PHASE 2: Находим начало расчёта для удаления
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (isCalculationMarker(line)) {
        const { id: currentMarkerId } = parseCalculationMarker(line);

        if (currentMarkerId === calculationId) {
          deleteStart = i; // Начало удаления (строка с маркером)
          break;
        }
      }
    }

    if (deleteStart === -1) {
      throw new Error(`Calculation "${calculationId}" not found in file`);
    }

    // PHASE 3: Находим конец расчёта (следующий маркер или конец файла)
    deleteEnd = deleteStart + 1; // Начинаем со следующей строки после маркера

    while (deleteEnd < lines.length) {
      const line = lines[deleteEnd];

      // Если встретили следующий маркер - стоп (не включаем его в удаление)
      if (isCalculationMarker(line)) {
        break;
      }

      // Если пустая строка - включаем её в удаление и продолжаем
      // (может быть разделитель между расчётами)
      if (line.trim() === '') {
        deleteEnd++;
        continue;
      }

      // Иначе это строка данных - включаем в удаление
      deleteEnd++;
    }

    // PHASE 4: Удаляем строки [deleteStart, deleteEnd)
    const deletedCount = deleteEnd - deleteStart;
    lines.splice(deleteStart, deletedCount);

    console.log(
      `[FileModifier] Deleted ${deletedCount} lines ` +
      `(marker + data) for calculation "${calculationId}"`
    );

    return lines;
  });
}

/**
 * Переименование расчёта в проекте (.pou + .det если существует)
 *
 * КРИТИЧЕСКАЯ ЛОГИКА:
 * - .pou файл - ОСНОВНОЙ, модифицируется ВСЕГДА
 * - .det файл - ДОПОЛНИТЕЛЬНЫЙ, модифицируется ТОЛЬКО если существует
 * - Атомарная операция: оба файла изменены ИЛИ оба откачены
 *
 * @param {string} projectDir - Папка проекта
 * @param {string} baseName - Базовое имя проекта (без расширения)
 * @param {string} oldMarkerId - Старый ID (с $)
 * @param {string} newMarkerId - Новый ID (с $)
 * @returns {Promise<{success, pouResult, detResult?, backupPaths}>}
 * @throws {Error} - При любых ошибках (с полным rollback)
 */
async function renameCalculationInProject(projectDir, baseName, oldMarkerId, newMarkerId) {
  const { join } = await import('path');
  const { existsSync } = await import('fs');

  const pouPath = join(projectDir, `${baseName}.pou`);
  const detPath = join(projectDir, `${baseName}.det`);

  const pouExists = existsSync(pouPath);
  const detExists = existsSync(detPath);

  // .pou файл ОБЯЗАТЕЛЕН (основной источник данных)
  if (!pouExists) {
    throw new Error(`Primary .pou file not found: ${pouPath}`);
  }

  const results = {
    success: false,
    pouResult: null,
    detResult: null,
    backupPaths: []
  };

  try {
    console.log(`[FileModifier] Starting rename in project: ${baseName}`);
    console.log(`[FileModifier] Old ID: "${oldMarkerId}" → New ID: "${newMarkerId}"`);

    // 1. Модифицируем .pou (ОБЯЗАТЕЛЬНО)
    console.log(`[FileModifier] Modifying primary .pou file: ${pouPath}`);
    results.pouResult = await renameCalculation(pouPath, oldMarkerId, newMarkerId);
    results.backupPaths.push(results.pouResult.backupPath);
    console.log(`[FileModifier] ✓ .pou file modified, backup: ${results.pouResult.backupPath}`);

    // 2. Модифицируем .det (если существует)
    if (detExists) {
      console.log(`[FileModifier] Modifying secondary .det file: ${detPath}`);
      results.detResult = await renameCalculation(detPath, oldMarkerId, newMarkerId);
      results.backupPaths.push(results.detResult.backupPath);
      console.log(`[FileModifier] ✓ .det file modified, backup: ${results.detResult.backupPath}`);
    } else {
      console.log(`[FileModifier] No .det file found, skipping (old project)`);
    }

    results.success = true;
    console.log(`[FileModifier] ✓✓ Rename completed successfully in project "${baseName}"`);

    return results;

  } catch (error) {
    console.error(`[FileModifier] ❌ Error during project modification: ${error.message}`);
    console.error(`[FileModifier] Rolling back all changes...`);

    // ROLLBACK: Восстанавливаем ВСЕ файлы из backup
    for (const backupPath of results.backupPaths) {
      try {
        if (existsSync(backupPath)) {
          const originalPath = backupPath.replace('.backup', '');
          await rename(backupPath, originalPath);
          console.log(`[FileModifier] ✓ Restored from backup: ${originalPath}`);
        }
      } catch (rollbackError) {
        console.error(
          `[FileModifier] CRITICAL: Failed to restore backup ${backupPath}: ${rollbackError.message}`
        );
      }
    }

    throw new Error(`Failed to rename calculation in project: ${error.message}`);
  }
}

/**
 * Удаление расчёта из проекта (.pou + .det если существует)
 *
 * КРИТИЧЕСКАЯ ЛОГИКА:
 * - .pou файл - ОСНОВНОЙ, модифицируется ВСЕГДА
 * - .det файл - ДОПОЛНИТЕЛЬНЫЙ, модифицируется ТОЛЬКО если существует
 * - Атомарная операция: оба файла изменены ИЛИ оба откачены
 *
 * @param {string} projectDir - Папка проекта
 * @param {string} baseName - Базовое имя проекта (без расширения)
 * @param {string} calculationId - ID расчёта для удаления (с $)
 * @returns {Promise<{success, pouResult, detResult?, backupPaths, totalLinesDeleted}>}
 * @throws {Error} - При любых ошибках (с полным rollback)
 */
async function deleteCalculationInProject(projectDir, baseName, calculationId) {
  const { join } = await import('path');
  const { existsSync } = await import('fs');

  const pouPath = join(projectDir, `${baseName}.pou`);
  const detPath = join(projectDir, `${baseName}.det`);

  const pouExists = existsSync(pouPath);
  const detExists = existsSync(detPath);

  // .pou файл ОБЯЗАТЕЛЕН (основной источник данных)
  if (!pouExists) {
    throw new Error(`Primary .pou file not found: ${pouPath}`);
  }

  const results = {
    success: false,
    pouResult: null,
    detResult: null,
    backupPaths: [],
    totalLinesDeleted: 0
  };

  try {
    console.log(`[FileModifier] Starting deletion in project: ${baseName}`);
    console.log(`[FileModifier] Calculation ID: "${calculationId}"`);

    // 1. Удаляем из .pou (ОБЯЗАТЕЛЬНО)
    console.log(`[FileModifier] Deleting from primary .pou file: ${pouPath}`);
    results.pouResult = await deleteCalculation(pouPath, calculationId);
    results.backupPaths.push(results.pouResult.backupPath);
    results.totalLinesDeleted += results.pouResult.linesModified;
    console.log(
      `[FileModifier] ✓ Deleted from .pou (${results.pouResult.linesModified} lines), ` +
      `backup: ${results.pouResult.backupPath}`
    );

    // 2. Удаляем из .det (если существует)
    if (detExists) {
      console.log(`[FileModifier] Deleting from secondary .det file: ${detPath}`);
      results.detResult = await deleteCalculation(detPath, calculationId);
      results.backupPaths.push(results.detResult.backupPath);
      results.totalLinesDeleted += results.detResult.linesModified;
      console.log(
        `[FileModifier] ✓ Deleted from .det (${results.detResult.linesModified} lines), ` +
        `backup: ${results.detResult.backupPath}`
      );
    } else {
      console.log(`[FileModifier] No .det file found, skipping (old project)`);
    }

    results.success = true;
    console.log(
      `[FileModifier] ✓✓ Deletion completed successfully in project "${baseName}" ` +
      `(${results.totalLinesDeleted} total lines deleted)`
    );

    return results;

  } catch (error) {
    console.error(`[FileModifier] ❌ Error during project modification: ${error.message}`);
    console.error(`[FileModifier] Rolling back all changes...`);

    // ROLLBACK: Восстанавливаем ВСЕ файлы из backup
    for (const backupPath of results.backupPaths) {
      try {
        if (existsSync(backupPath)) {
          const originalPath = backupPath.replace('.backup', '');
          await rename(backupPath, originalPath);
          console.log(`[FileModifier] ✓ Restored from backup: ${originalPath}`);
        }
      } catch (rollbackError) {
        console.error(
          `[FileModifier] CRITICAL: Failed to restore backup ${backupPath}: ${rollbackError.message}`
        );
      }
    }

    throw new Error(`Failed to delete calculation in project: ${error.message}`);
  }
}

export {
  validateMarkerId,
  validateModifiedFile,
  safeFileWrite,
  renameCalculation,
  deleteCalculation,
  renameCalculationInProject,
  deleteCalculationInProject
};
