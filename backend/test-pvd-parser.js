/**
 * Тест PVD parser - проверка базовой структуры
 */

import { PvdParser } from './src/parsers/formats/pvdParser.js';
import { resolve } from 'path';

const parser = new PvdParser();
const filePath = resolve('../test-data/V8/V8_2000.pvd');

console.log('Testing PVD Parser...');
console.log('File:', filePath);

const result = await parser.parse(filePath);

console.log('\n=== Parsed Result ===');
console.log('Format:', result.format);
console.log('File name:', result.fileName);

console.log('\n=== Metadata ===');
console.log('RPM:', result.metadata.rpm);
console.log('Cylinders:', result.metadata.cylinders);
console.log('Engine Type:', result.metadata.engineType);
console.log('Num Turbo:', result.metadata.numTurbo);
console.log('Firing Order:', result.metadata.firingOrder);

console.log('\n=== Column Headers ===');
console.log('Headers:', result.columnHeaders.slice(0, 5), '...');

console.log('\n=== Data ===');
console.log('Total data points:', result.data.length);

if (result.data.length > 0) {
  const firstPoint = result.data[0];
  console.log('\n=== First Data Point ===');
  console.log('Deg:', firstPoint.deg);
  console.log('Cylinders data count:', firstPoint.cylinders.length);
  console.log('Cylinder 1 Volume:', firstPoint.cylinders[0].volume);
  console.log('Cylinder 1 Pressure:', firstPoint.cylinders[0].pressure);
  console.log('Cylinder 2 Volume:', firstPoint.cylinders[1].volume);
  console.log('Cylinder 2 Pressure:', firstPoint.cylinders[1].pressure);

  const lastPoint = result.data[result.data.length - 1];
  console.log('\n=== Last Data Point ===');
  console.log('Deg:', lastPoint.deg);
  console.log('Cylinder 1 Volume:', lastPoint.cylinders[0].volume);
  console.log('Cylinder 1 Pressure:', lastPoint.cylinders[0].pressure);
}

console.log('\n✓ Test completed');
