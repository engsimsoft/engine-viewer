/**
 * Тест PVD parser - 1-цилиндровый двигатель (edge case)
 */

import { PvdParser } from './src/parsers/formats/pvdParser.js';
import { resolve } from 'path';

const parser = new PvdParser();
const filePath = resolve('../test-data/MOTO 250 V1/0.55 MF V1_10000.pvd');

console.log('Testing PVD Parser with 1-cylinder engine...');
console.log('File:', filePath);

try {
  const result = await parser.parse(filePath);

  console.log('\n=== Parsed Result ===');
  console.log('Format:', result.format);
  console.log('File name:', result.fileName);

  console.log('\n=== Metadata ===');
  console.log('RPM:', result.metadata.rpm);
  console.log('Cylinders:', result.metadata.cylinders);
  console.log('Engine Type:', result.metadata.engineType);
  console.log('Num Turbo:', result.metadata.numTurbo);

  console.log('\n=== Data ===');
  console.log('Total data points:', result.data.length);

  if (result.data.length > 0) {
    const firstPoint = result.data[0];
    console.log('\n=== First Data Point ===');
    console.log('Deg:', firstPoint.deg);
    console.log('Cylinders data count:', firstPoint.cylinders.length);
    console.log('Cylinder 1 Volume:', firstPoint.cylinders[0].volume);
    console.log('Cylinder 1 Pressure:', firstPoint.cylinders[0].pressure);

    const lastPoint = result.data[result.data.length - 1];
    console.log('\n=== Last Data Point ===');
    console.log('Deg:', lastPoint.deg);
    console.log('Cylinder 1 Volume:', lastPoint.cylinders[0].volume);
    console.log('Cylinder 1 Pressure:', lastPoint.cylinders[0].pressure);
  }

  console.log('\n✓ 1-cylinder test completed successfully');
} catch (error) {
  console.error('\n✗ Test FAILED:', error.message);
  process.exit(1);
}
