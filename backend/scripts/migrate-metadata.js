#!/usr/bin/env node

/**
 * Migration Script: Metadata v0 → v1.0
 *
 * Преобразует старые метаданные в новый формат:
 * - Разделение на "auto" (from .prt) и "manual" (user edits)
 * - Добавление "version": "1.0"
 * - Добавление "displayName" field
 * - Переименование "projectId" → "id"
 * - Переименование "createdAt" → "created", "updatedAt" → "modified"
 *
 * Usage:
 *   node backend/scripts/migrate-metadata.js
 *
 * Notes:
 *   - Creates backup: .metadata.backup/
 *   - Preserves all user data
 *   - Auto metadata will be added later by fileScanner
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const METADATA_DIR = path.join(PROJECT_ROOT, '.metadata');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.metadata.backup');

/**
 * Преобразует старый metadata в новый формат
 * @param {Object} oldMetadata - Старая структура метаданных
 * @returns {Object} - Новая структура (v1.0)
 */
function migrateMetadata(oldMetadata) {
  // Извлекаем manual данные из старого формата
  const manual = {
    description: oldMetadata.description || '',
    client: oldMetadata.client || '',
    tags: oldMetadata.tags || [],
    status: oldMetadata.status || 'active',
    notes: oldMetadata.notes || '',
    color: oldMetadata.color || ''
  };

  // Создаём новую структуру
  const newMetadata = {
    version: '1.0',
    id: oldMetadata.projectId || oldMetadata.id || '',
    displayName: '', // По умолчанию пустой (fallback to ID)
    // auto: будет добавлено fileScanner при следующем сканировании
    manual,
    created: oldMetadata.createdAt || new Date().toISOString(),
    modified: oldMetadata.updatedAt || new Date().toISOString()
  };

  return newMetadata;
}

/**
 * Создаёт backup директорию и копирует все файлы
 * @returns {Promise<number>} - Количество скопированных файлов
 */
async function createBackup() {
  try {
    // Создаём backup директорию
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Читаем все файлы из .metadata/
    const files = await fs.readdir(METADATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    // Копируем каждый файл
    let count = 0;
    for (const file of jsonFiles) {
      const sourcePath = path.join(METADATA_DIR, file);
      const backupPath = path.join(BACKUP_DIR, file);
      await fs.copyFile(sourcePath, backupPath);
      count++;
    }

    console.log(`✅ Backup created: ${count} files → ${BACKUP_DIR}`);
    return count;
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    throw error;
  }
}

/**
 * Мигрирует все metadata файлы
 * @returns {Promise<Object>} - Статистика миграции
 */
async function migrateAllMetadata() {
  const stats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Читаем все файлы
    const files = await fs.readdir(METADATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    stats.total = jsonFiles.length;

    console.log(`\n📋 Found ${stats.total} metadata files`);
    console.log('='.repeat(80));

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(METADATA_DIR, file);

        // Читаем старый файл
        const fileContent = await fs.readFile(filePath, 'utf8');
        const oldMetadata = JSON.parse(fileContent);

        // Проверяем версию (пропускаем уже мигрированные)
        if (oldMetadata.version === '1.0') {
          console.log(`⏭️  ${file} - already migrated (v1.0)`);
          stats.skipped++;
          continue;
        }

        // Мигрируем
        const newMetadata = migrateMetadata(oldMetadata);

        // Сохраняем с красивым форматированием
        const newContent = JSON.stringify(newMetadata, null, 2);
        await fs.writeFile(filePath, newContent, 'utf8');

        console.log(`✅ ${file} - migrated successfully`);
        stats.migrated++;
      } catch (error) {
        console.error(`❌ ${file} - error:`, error.message);
        stats.errors.push({ file, error: error.message });
      }
    }

    return stats;
  } catch (error) {
    console.error('❌ Error reading metadata directory:', error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Metadata Migration Script: v0 → v1.0');
  console.log('='.repeat(80));

  try {
    // 1. Проверяем что директория существует
    try {
      await fs.access(METADATA_DIR);
    } catch {
      console.log('⚠️  No .metadata directory found - nothing to migrate');
      return;
    }

    // 2. Создаём backup
    console.log('\n📦 Creating backup...');
    await createBackup();

    // 3. Мигрируем все файлы
    console.log('\n🔄 Migrating metadata files...');
    const stats = await migrateAllMetadata();

    // 4. Выводим статистику
    console.log('\n' + '='.repeat(80));
    console.log('📊 Migration Summary:');
    console.log(`   Total files:    ${stats.total}`);
    console.log(`   ✅ Migrated:    ${stats.migrated}`);
    console.log(`   ⏭️  Skipped:     ${stats.skipped}`);
    console.log(`   ❌ Errors:      ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
    }

    console.log('\n✅ Migration complete!');
    console.log(`📁 Backup location: ${BACKUP_DIR}`);
    console.log('\n⚠️  IMPORTANT: Run fileScanner to populate "auto" metadata from .prt files');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('💡 Restore from backup:', BACKUP_DIR);
    process.exit(1);
  }
}

// Run migration
main();
