/**
 * Тестовый скрипт для fileScanner.js
 * Демонстрирует работу сканирования директории и file watching
 */

import {
  scanDirectory,
  scanProjects,
  getDirectoryStats,
  formatFileSize,
  createFileWatcher
} from './src/services/fileScanner.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testDataPath = join(__dirname, '../test-data');

async function testFileScanner() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         ТЕСТИРОВАНИЕ FILE SCANNER                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // ============================================
  // Тест 1: Сканирование директории
  // ============================================
  console.log('📁 ТЕСТ 1: Сканирование директории');
  console.log('─'.repeat(65));

  try {
    const startTime = performance.now();
    const files = await scanDirectory(testDataPath, ['.det']);
    const endTime = performance.now();

    console.log(`✅ Директория: ${testDataPath}`);
    console.log(`✅ Найдено файлов: ${files.length}`);
    console.log(`✅ Время сканирования: ${(endTime - startTime).toFixed(2)}мс\n`);

    if (files.length > 0) {
      console.log('   Список файлов:');
      console.log('   ┌─────────────────────────────────────────────────────────┐');

      files.forEach((file, i) => {
        const num = `${i + 1}.`.padStart(3);
        const name = file.name.padEnd(30);
        const size = formatFileSize(file.size).padStart(10);
        const date = new Date(file.modifiedAt).toLocaleString('ru-RU').padStart(20);

        console.log(`   │ ${num} ${name} ${size} ${date} │`);
      });

      console.log('   └─────────────────────────────────────────────────────────┘\n');
    } else {
      console.log('   ⚠️  Нет .det файлов в директории\n');
    }
  } catch (error) {
    console.error(`❌ Ошибка сканирования: ${error.message}\n`);
  }

  // ============================================
  // Тест 2: Статистика директории
  // ============================================
  console.log('📊 ТЕСТ 2: Статистика директории');
  console.log('─'.repeat(65));

  try {
    const stats = await getDirectoryStats(testDataPath, ['.det']);

    console.log(`✅ Директория: ${stats.directoryPath}`);
    console.log(`✅ Количество файлов: ${stats.filesCount}`);
    console.log(`✅ Общий размер: ${stats.totalSizeFormatted} (${stats.totalSize} байт)`);

    if (stats.oldestFile) {
      console.log(`✅ Самый старый файл: ${stats.oldestFile.name}`);
      console.log(`   Создан: ${new Date(stats.oldestFile.createdAt).toLocaleString('ru-RU')}`);
    }

    if (stats.newestFile) {
      console.log(`✅ Самый новый файл: ${stats.newestFile.name}`);
      console.log(`   Изменён: ${new Date(stats.newestFile.modifiedAt).toLocaleString('ru-RU')}`);
    }

    console.log();
  } catch (error) {
    console.error(`❌ Ошибка получения статистики: ${error.message}\n`);
  }

  // ============================================
  // Тест 3: Сканирование проектов (с парсингом)
  // ============================================
  console.log('🔍 ТЕСТ 3: Сканирование проектов (с парсингом метаданных)');
  console.log('─'.repeat(65));

  try {
    const startTime = performance.now();
    const projects = await scanProjects(testDataPath, ['.det'], 10485760); // 10MB limit
    const endTime = performance.now();

    console.log(`✅ Найдено проектов: ${projects.length}`);
    console.log(`✅ Время сканирования + парсинга: ${(endTime - startTime).toFixed(2)}мс\n`);

    if (projects.length > 0) {
      console.log('   Детали проектов:');
      console.log('   ┌──────────────────────────────────────────────────────────┐');

      projects.forEach((project, i) => {
        const num = `${i + 1}.`.padStart(3);
        const id = project.id.padEnd(25);

        console.log(`   │ ${num} ID: ${id}                          │`);
        console.log(`   │     Файл: ${project.fileName.padEnd(42)} │`);
        console.log(`   │     Размер: ${formatFileSize(project.fileSize).padStart(8)}                                  │`);
        console.log(`   │     Двигатель: ${project.numCylinders} цилиндра, ${project.engineType.padEnd(6)}             │`);
        console.log(`   │     Расчётов: ${project.calculationsCount.toString().padStart(2)}                                    │`);
        console.log(`   │     Изменён: ${new Date(project.modifiedAt).toLocaleString('ru-RU').padEnd(20)} │`);

        if (project.error) {
          console.log(`   │     ⚠️  Ошибка: ${project.error.padEnd(35)} │`);
        }

        if (i < projects.length - 1) {
          console.log('   │                                                          │');
        }
      });

      console.log('   └──────────────────────────────────────────────────────────┘\n');
    }
  } catch (error) {
    console.error(`❌ Ошибка сканирования проектов: ${error.message}\n`);
  }

  // ============================================
  // Тест 4: API Response пример
  // ============================================
  console.log('📦 ТЕСТ 4: Пример API ответа GET /api/projects');
  console.log('─'.repeat(65));

  try {
    const projects = await scanProjects(testDataPath, ['.det'], 10485760);

    const apiResponse = {
      success: true,
      count: projects.length,
      projects: projects.slice(0, 2).map(p => ({
        id: p.id,
        fileName: p.fileName,
        fileSize: p.fileSize,
        modifiedAt: p.modifiedAt,
        metadata: {
          numCylinders: p.numCylinders,
          engineType: p.engineType,
          calculationsCount: p.calculationsCount
        }
      }))
    };

    console.log(JSON.stringify(apiResponse, null, 2));
    console.log();
  } catch (error) {
    console.error(`❌ Ошибка создания API ответа: ${error.message}\n`);
  }

  // ============================================
  // Тест 5: File Watcher (опционально)
  // ============================================
  console.log('👀 ТЕСТ 5: File Watcher (отслеживание изменений)');
  console.log('─'.repeat(65));
  console.log('⚠️  Этот тест создаёт watcher, но не запускает его долго.');
  console.log('   Для полноценного теста нужно изменить/добавить/удалить файл в директории.\n');

  try {
    const watcher = createFileWatcher(testDataPath, ['.det'], {
      onAdd: (filePath) => {
        console.log(`   ✅ Событие ADD: ${filePath}`);
      },
      onChange: (filePath) => {
        console.log(`   ✅ Событие CHANGE: ${filePath}`);
      },
      onRemove: (filePath) => {
        console.log(`   ✅ Событие REMOVE: ${filePath}`);
      },
      onError: (error) => {
        console.error(`   ❌ Событие ERROR: ${error.message}`);
      }
    });

    // Ждём 2 секунды чтобы увидеть 'ready' событие
    await new Promise(resolve => setTimeout(resolve, 2000));

    const watchedFiles = watcher.getWatchedFiles();
    console.log(`\n   📋 Отслеживается файлов: ${watchedFiles.length}`);

    // Останавливаем watcher
    await watcher.close();
    console.log();
  } catch (error) {
    console.error(`❌ Ошибка создания watcher: ${error.message}\n`);
  }

  // ============================================
  // Итоги
  // ============================================
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         ✅ ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log('💡 СЛЕДУЮЩИЕ ШАГИ:');
  console.log('   1. Интегрировать fileScanner в API routes (projects.js)');
  console.log('   2. Добавить кэширование результатов сканирования');
  console.log('   3. Настроить file watcher в server.js (опционально)\n');
}

// Запуск тестов
testFileScanner().catch(console.error);
