/**
 * Красивое отображение результатов парсинга
 */

import { parseDetFile } from './src/services/fileParser.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function showResults() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         РЕЗУЛЬТАТЫ ПАРСИНГА .DET ФАЙЛОВ                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Файл 1: Vesta
  const vesta = await parseDetFile(join(__dirname, '../test-data/Vesta 1.6 IM.det'));

  console.log('📁 ФАЙЛ 1: Vesta 1.6 IM.det');
  console.log('─'.repeat(65));
  console.log(`   Двигатель:      ${vesta.metadata.numCylinders} цилиндра, ${vesta.metadata.engineType}`);
  console.log(`   Расчетов:       ${vesta.calculations.length}`);
  console.log(`   Точек данных:   ${vesta.calculations.reduce((s, c) => s + c.dataPoints.length, 0)}`);
  console.log('\n   Список расчетов (названия для UI):');
  console.log('   ┌─────────────────────────────────────────────────┐');

  vesta.calculations.forEach((calc, i) => {
    const num = `${i + 1}.`.padStart(3);
    const name = `"${calc.name}"`.padEnd(25);
    const points = `${calc.dataPoints.length} точек`.padStart(10);
    console.log(`   │ ${num} ${name} ${points}       │`);
  });

  console.log('   └─────────────────────────────────────────────────┘\n');

  // Файл 2: BMW
  const bmw = await parseDetFile(join(__dirname, '../test-data/BMW M42.det'));

  console.log('📁 ФАЙЛ 2: BMW M42.det');
  console.log('─'.repeat(65));
  console.log(`   Двигатель:      ${bmw.metadata.numCylinders} цилиндра, ${bmw.metadata.engineType}`);
  console.log(`   Расчетов:       ${bmw.calculations.length}`);
  console.log(`   Точек данных:   ${bmw.calculations.reduce((s, c) => s + c.dataPoints.length, 0)}`);
  console.log('\n   Список расчетов (названия для UI):');
  console.log('   ┌─────────────────────────────────────────────────┐');

  bmw.calculations.slice(0, 20).forEach((calc, i) => {
    const num = `${i + 1}.`.padStart(3);
    const name = `"${calc.name}"`.padEnd(25);
    const points = `${calc.dataPoints.length} точек`.padStart(10);
    console.log(`   │ ${num} ${name} ${points}       │`);
  });

  if (bmw.calculations.length > 20) {
    console.log(`   │   ... ещё ${bmw.calculations.length - 20} расчетов ...                        │`);
  }

  console.log('   └─────────────────────────────────────────────────┘\n');

  // Примеры API данных
  console.log('📊 ПРИМЕР API ОТВЕТА (JSON):');
  console.log('─'.repeat(65));

  const apiExample = {
    project: {
      fileName: vesta.fileName,
      engineType: vesta.metadata.engineType,
      numCylinders: vesta.metadata.numCylinders
    },
    calculations: vesta.calculations.slice(0, 5).map(calc => ({
      id: calc.id,              // Для API (с символом $)
      name: calc.name,          // Для UI (без символа $)
      dataPointsCount: calc.dataPoints.length
    }))
  };

  console.log(JSON.stringify(apiExample, null, 2));

  console.log('\n💡 КАК ЭТО РАБОТАЕТ:');
  console.log('─'.repeat(65));
  console.log('   В файле:        $3.1 R 0.86');
  console.log('   ↓');
  console.log('   Парсер извлекает:');
  console.log('   • id:   "$3.1 R 0.86"  (для API запросов)');
  console.log('   • name: "3.1 R 0.86"   (для отображения в UI)');
  console.log('   ↓');
  console.log('   React компонент показывает: "3.1 R 0.86" (без $)');
  console.log('   API запрос использует: $3.1%20R%200.86 (с $)\n');

  console.log('✅ Парсер успешно обрабатывает оба файла!\n');
}

showResults().catch(console.error);
