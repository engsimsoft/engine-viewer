/**
 * Тестовый скрипт для демонстрации названий расчетов
 * Показывает как будут отображаться названия в UI
 */

import { parseDetFile } from './src/services/fileParser.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testFilePath = join(__dirname, '../test-data/Vesta 1.6 IM.det');

async function demonstrateCalculationNames() {
  console.log('🎯 Демонстрация названий расчетов\n');
  console.log('Показывает как будут выглядеть названия в UI интерфейсе\n');
  console.log('─'.repeat(80));

  const project = await parseDetFile(testFilePath);

  console.log('\n📋 Список расчетов для отображения в UI:\n');

  // Симулируем список выбора в UI (dropdown/select)
  console.log('   ┌─ Выберите расчет для анализа ────────────────────┐');
  project.calculations.forEach((calc, index) => {
    // В UI показываем name (без символа $)
    const displayName = calc.name.padEnd(25);
    const pointsCount = `(${calc.dataPoints.length} точек)`;
    console.log(`   │ ${(index + 1).toString().padStart(2)}. ${displayName} ${pointsCount.padStart(12)} │`);
  });
  console.log('   └──────────────────────────────────────────────────┘');

  console.log('\n📊 API данные (JSON для frontend):\n');

  // Симулируем API response
  const apiResponse = {
    project: {
      fileName: project.fileName,
      engineType: project.metadata.engineType,
      numCylinders: project.metadata.numCylinders
    },
    calculations: project.calculations.map(calc => ({
      id: calc.id,              // Для API запросов (с $)
      name: calc.name,          // Для отображения в UI (без $)
      dataPointsCount: calc.dataPoints.length
    }))
  };

  console.log(JSON.stringify(apiResponse, null, 2));

  console.log('\n💡 Примеры использования:\n');

  console.log('   Frontend делает запрос к API:');
  console.log('   GET /api/project/Vesta%201.6%20IM?calculations[]=$3.1%20R%200.86&calculations[]=$2.1');
  console.log('                                                     ^^^^^^^^^^^^^^^^^ ID с $\n');

  console.log('   Frontend отображает в UI:');
  console.log('   ✓ Выбраны расчеты: "3.1 R 0.86" и "2.1"');
  console.log('                       ^^^^^^^^^^^^   ^^^^ name без $\n');

  console.log('   React компонент:');
  console.log('   ```jsx');
  console.log('   {calculations.map(calc => (');
  console.log('     <option key={calc.id} value={calc.id}>');
  console.log('       {calc.name}  {/* Показываем без $ */}');
  console.log('     </option>');
  console.log('   ))}');
  console.log('   ```');

  console.log('\n─'.repeat(80));
  console.log('\n✅ Логика корректна:');
  console.log('   • Символ $ - технический маркер (добавляется backend программой расчётов)');
  console.log('   • После $ - текст, который ввёл пользователь');
  console.log('   • В UI показываем БЕЗ $ (то, что ввёл пользователь)');
  console.log('   • В API используем С $ (уникальный идентификатор)');
  console.log();
}

demonstrateCalculationNames().catch(console.error);
