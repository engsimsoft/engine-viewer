import { parseDetFile } from './src/services/fileParser.js';

const project = await parseDetFile('../test-data/TM Soft ShortCut.det');

console.log('Format:', project.format);
console.log('Calculations:', project.calculations.length);

const calc = project.calculations[0];
console.log('\n=== Calculation 1 ===');
console.log('ID:', calc.id);
console.log('Data points:', calc.dataPoints.length);

const point = calc.dataPoints[0];
console.log('\n=== Data point 1 ===');
console.log('RPM:', point.RPM);
console.log('PCylMax:', point.PCylMax);
console.log('TCylMax:', point.TCylMax);
console.log('Convergence:', point.Convergence);
