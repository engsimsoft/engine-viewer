/**
 * Скрипт для обновления metadata файлов с данными о клапанах
 * Читает .prt файлы и добавляет valvesPerCylinder, inletValves, exhaustValves
 */

import { PrtParser } from './src/parsers/formats/prtParser.js';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const TEST_DATA_DIR = '../test-data';
const METADATA_DIR = '../.metadata';

async function updateMetadataWithValves() {
  console.log('🔧 Updating metadata files with valves data...\n');

  // Получаем список .prt файлов
  const files = await readdir(TEST_DATA_DIR);
  const prtFiles = files.filter(f => f.endsWith('.prt'));

  const parser = new PrtParser();

  for (const prtFile of prtFiles) {
    try {
      console.log(`📄 Processing: ${prtFile}`);

      // Парсим .prt файл
      const prtPath = join(TEST_DATA_DIR, prtFile);
      const result = await parser.parse(prtPath);

      // Получаем projectId из имени файла
      const projectId = prtFile
        .replace('.prt', '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

      // Читаем metadata файл
      const metadataPath = join(METADATA_DIR, `${projectId}.json`);
      let metadata;

      try {
        const metadataContent = await readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      } catch (err) {
        console.log(`   ⚠️  Metadata file not found: ${projectId}.json, skipping`);
        continue;
      }

      // Обновляем auto секцию
      if (!metadata.auto) {
        console.log(`   ⚠️  No auto section in metadata, skipping`);
        continue;
      }

      // Удаляем exhaustSystem, добавляем valves
      delete metadata.auto.exhaustSystem;
      metadata.auto.valvesPerCylinder = result.engine.valvesPerCylinder;
      metadata.auto.inletValves = result.engine.inletValves;
      metadata.auto.exhaustValves = result.engine.exhaustValves;

      // Обновляем modified date
      metadata.modified = new Date().toISOString();

      // Сохраняем
      await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

      console.log(`   ✅ Updated: ${projectId}.json`);
      console.log(`      Valves: ${result.engine.valvesPerCylinder} (${result.engine.inletValves} In + ${result.engine.exhaustValves} Ex)\n`);

    } catch (error) {
      console.error(`   ❌ Error processing ${prtFile}:`, error.message);
    }
  }

  console.log('✅ Metadata update complete!');
}

// Run
updateMetadataWithValves();
