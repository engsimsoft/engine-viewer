/**
 * Тестовый скрипт для проверки парсера .det файлов
 *
 * Запуск: node test-parser.js
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  parseDetFile,
  getProjectSummary
} from './src/services/fileParser.js';

// Получаем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к тестовому файлу
const testFilePath = join(__dirname, '../test-data/Vesta 1.6 IM.det');

async function testParser() {
  console.log('🧪 Тестирование парсера .det файлов\n');
  console.log('📁 Файл:', testFilePath);
  console.log('─'.repeat(80));

  try {
    // Парсим файл
    console.log('\n⏳ Парсинг файла...');
    const startTime = Date.now();

    const project = await parseDetFile(testFilePath);

    const endTime = Date.now();
    const parseTime = endTime - startTime;

    console.log(`✅ Файл успешно распарсен за ${parseTime}мс\n`);

    // Выводим метаданные
    console.log('📊 Метаданные двигателя:');
    console.log('   Количество цилиндров:', project.metadata.numCylinders);
    console.log('   Тип двигателя:', project.metadata.engineType);
    console.log();

    // Выводим информацию о колонках
    console.log('📋 Заголовки колонок (' + project.columnHeaders.length + ' колонок):');
    console.log('   ', project.columnHeaders.slice(0, 10).join(', ') + '...');
    console.log();

    // Выводим информацию о расчетах
    console.log(`🔢 Расчеты (всего: ${project.calculations.length}):`);
    project.calculations.forEach((calc, index) => {
      console.log(`   ${index + 1}. ${calc.id} "${calc.name}" - ${calc.dataPoints.length} точек данных`);
    });
    console.log();

    // Выводим первую точку данных первого расчета
    if (project.calculations.length > 0 && project.calculations[0].dataPoints.length > 0) {
      const firstCalc = project.calculations[0];
      const firstPoint = firstCalc.dataPoints[0];

      console.log(`📈 Первая точка данных расчета "${firstCalc.id}":`);
      console.log('   RPM:', firstPoint.RPM);
      console.log('   P-Av:', firstPoint['P-Av'], 'кВт');
      console.log('   Torque:', firstPoint.Torque, 'Н·м');
      console.log('   PurCyl:', firstPoint.PurCyl);
      console.log('   TUbMax:', firstPoint.TUbMax, 'K');
      console.log('   TCylMax:', firstPoint.TCylMax, 'K');
      console.log('   PCylMax:', firstPoint.PCylMax, 'бар');
      console.log('   Deto:', firstPoint.Deto);
      console.log('   Convergence:', firstPoint.Convergence);
      console.log();
    }

    // Выводим последнюю точку данных последнего расчета
    if (project.calculations.length > 0) {
      const lastCalc = project.calculations[project.calculations.length - 1];
      const lastPoint = lastCalc.dataPoints[lastCalc.dataPoints.length - 1];

      console.log(`📉 Последняя точка данных расчета "${lastCalc.id}":`);
      console.log('   RPM:', lastPoint.RPM);
      console.log('   P-Av:', lastPoint['P-Av'], 'кВт');
      console.log('   Torque:', lastPoint.Torque, 'Н·м');
      console.log();
    }

    // Выводим краткую информацию о проекте (для API)
    const summary = getProjectSummary(project);
    console.log('📦 Краткая информация о проекте (для API):');
    console.log('   ', JSON.stringify(summary, null, 2).split('\n').join('\n    '));
    console.log();

    // Статистика
    console.log('─'.repeat(80));
    console.log('📊 Статистика:');

    const totalDataPoints = project.calculations.reduce(
      (sum, calc) => sum + calc.dataPoints.length,
      0
    );

    console.log('   Всего расчетов:', project.calculations.length);
    console.log('   Всего точек данных:', totalDataPoints);
    console.log('   Среднее количество точек на расчет:', Math.round(totalDataPoints / project.calculations.length));
    console.log();

    // Диапазон оборотов
    let minRPM = Infinity;
    let maxRPM = -Infinity;

    project.calculations.forEach(calc => {
      calc.dataPoints.forEach(point => {
        if (point.RPM < minRPM) minRPM = point.RPM;
        if (point.RPM > maxRPM) maxRPM = point.RPM;
      });
    });

    console.log('   Диапазон оборотов:', minRPM, '-', maxRPM, 'об/мин');

    // Диапазон мощности
    let minPower = Infinity;
    let maxPower = -Infinity;

    project.calculations.forEach(calc => {
      calc.dataPoints.forEach(point => {
        if (point['P-Av'] < minPower) minPower = point['P-Av'];
        if (point['P-Av'] > maxPower) maxPower = point['P-Av'];
      });
    });

    console.log('   Диапазон мощности:', minPower.toFixed(2), '-', maxPower.toFixed(2), 'кВт');

    // Диапазон крутящего момента
    let minTorque = Infinity;
    let maxTorque = -Infinity;

    project.calculations.forEach(calc => {
      calc.dataPoints.forEach(point => {
        if (point.Torque < minTorque) minTorque = point.Torque;
        if (point.Torque > maxTorque) maxTorque = point.Torque;
      });
    });

    console.log('   Диапазон крутящего момента:', minTorque.toFixed(2), '-', maxTorque.toFixed(2), 'Н·м');

    console.log();
    console.log('✅ Тестирование завершено успешно!');

  } catch (error) {
    console.error('\n❌ Ошибка при тестировании:', error.message);
    console.error('\nПолный стек ошибки:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Запускаем тест
testParser();
