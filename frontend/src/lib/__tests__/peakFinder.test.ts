/**
 * Тесты для Peak Finder функций
 *
 * Проверяем работу поиска и форматирования пиковых значений
 * с реальными данными из Vesta 1.6 IM.det
 */

import {
  findPeak,
  findPeakForCylinder,
  findPeakAveraged,
  findPeaksForPreset,
  formatPeakValue,
} from '../peakFinder';
import type { DataPoint } from '../../types/index';
import type { PeakValue } from '../../types/v2';

// ============================================================================
// Test Data - Реальные данные из Vesta 1.6 IM.det (выборка ключевых точек)
// ============================================================================

const vestaTestData: DataPoint[] = [
  {
    RPM: 2600,
    'P-Av': 33.69,
    Torque: 123.73,
    PurCyl: [0.8898, 0.8898, 0.8898, 0.8897],
    TUbMax: [719.6, 719.2, 719.4, 719.4],
    TCylMax: [2302.2, 2301.9, 2302.0, 2301.9],
    PCylMax: [64.6, 64.6, 64.6, 64.6],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 4200,
    'P-Av': 71.54,
    Torque: 162.66,
    PurCyl: [0.9684, 0.9684, 0.9684, 0.9684],
    TUbMax: [668.0, 668.4, 668.3, 668.0],
    TCylMax: [2403.8, 2404.3, 2404.2, 2403.8],
    PCylMax: [79.4, 79.4, 79.4, 79.4],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 5200,
    'P-Av': 101.15,
    Torque: 185.75, // <- Max Torque
    PurCyl: [0.9801, 0.9801, 0.9801, 0.9801],
    TUbMax: [683.6, 683.2, 683.0, 683.4],
    TCylMax: [2421.2, 2420.7, 2420.6, 2420.9],
    PCylMax: [89.7, 89.7, 89.7, 89.7],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 6400,
    'P-Av': 127.33,
    Torque: 189.98, // <- Another high torque point
    PurCyl: [0.9894, 0.9894, 0.9894, 0.9894],
    TUbMax: [704.6, 703.8, 703.8, 703.5],
    TCylMax: [2431.7, 2430.9, 2430.8, 2429.9],
    PCylMax: [94.3, 94.3, 94.3, 94.3], // <- Max PCylMax
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 6600,
    'P-Av': 130.30,
    Torque: 188.53,
    PurCyl: [0.9900, 0.9900, 0.9900, 0.9900], // <- Max PurCyl
    TUbMax: [708.9, 709.0, 709.0, 708.8], // <- Max TUbMax
    TCylMax: [2431.6, 2431.8, 2432.0, 2431.5], // <- Max TCylMax
    PCylMax: [94.5, 94.5, 94.5, 94.5],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 7200,
    'P-Av': 135.11,
    Torque: 179.20,
    PurCyl: [0.9889, 0.9889, 0.9889, 0.9889],
    TUbMax: [696.1, 695.9, 696.5, 696.6],
    TCylMax: [2411.8, 2411.3, 2412.2, 2412.0],
    PCylMax: [91.4, 91.4, 91.4, 91.4],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 7400,
    'P-Av': 136.10, // <- Max P-Av
    Torque: 175.63,
    PurCyl: [0.9876, 0.9876, 0.9876, 0.9876],
    TUbMax: [695.1, 695.1, 694.5, 694.4],
    TCylMax: [2405.4, 2405.4, 2405.3, 2405.1],
    PCylMax: [90.3, 90.3, 90.3, 90.3],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
];

// ============================================================================
// Tests
// ============================================================================

console.log('🧪 Peak Finder Tests\n');
console.log('=' .repeat(60));

// Test 1: findPeak - простой параметр (P-Av)
console.log('\n✅ Test 1: findPeak - Power (P-Av)');
try {
  const peakPower = findPeak(vestaTestData, 'P-Av');
  console.log(`   Expected: value=136.10, rpm=7400`);
  console.log(`   Result: value=${peakPower.value}, rpm=${peakPower.rpm}`);
  console.log(`   Parameter: ${peakPower.parameter}`);
  console.log(`   DisplayLabel: ${peakPower.displayLabel}`);
  const pass = peakPower.value === 136.10 && peakPower.rpm === 7400;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 2: findPeak - Torque
console.log('\n✅ Test 2: findPeak - Torque');
try {
  const peakTorque = findPeak(vestaTestData, 'Torque');
  console.log(`   Expected: value=189.98, rpm=6400`);
  console.log(`   Result: value=${peakTorque.value}, rpm=${peakTorque.rpm}`);
  console.log(`   DisplayLabel: ${peakTorque.displayLabel}`);
  const pass = peakTorque.value === 189.98 && peakTorque.rpm === 6400;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 3: findPeakForCylinder - PCylMax для цилиндра 1
console.log('\n✅ Test 3: findPeakForCylinder - PCylMax(1)');
try {
  const peakPCyl1 = findPeakForCylinder(vestaTestData, 'PCylMax', 0);
  console.log(`   Expected: value=94.5, rpm=6600`);
  console.log(`   Result: value=${peakPCyl1.value}, rpm=${peakPCyl1.rpm}`);
  console.log(`   Parameter: ${peakPCyl1.parameter}`);
  console.log(`   DisplayLabel: ${peakPCyl1.displayLabel}`);
  const pass = peakPCyl1.value === 94.5 && peakPCyl1.rpm === 6600;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 4: findPeakAveraged - TCylMax (усреднённый)
console.log('\n✅ Test 4: findPeakAveraged - TCylMax (averaged)');
try {
  const peakTCyl = findPeakAveraged(vestaTestData, 'TCylMax');
  // At RPM 6600: TCylMax = [2431.6, 2431.8, 2432.0, 2431.5]
  // Average = (2431.6 + 2431.8 + 2432.0 + 2431.5) / 4 = 2431.725
  console.log(`   Expected: rpm=6600, value≈2431.7`);
  console.log(`   Result: value=${peakTCyl.value.toFixed(1)}, rpm=${peakTCyl.rpm}`);
  console.log(`   DisplayLabel: ${peakTCyl.displayLabel}`);
  const pass = peakTCyl.rpm === 6600 && Math.abs(peakTCyl.value - 2431.725) < 0.01;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 5: findPeaksForPreset - Preset 1 (Power & Torque)
console.log('\n✅ Test 5: findPeaksForPreset - Preset 1 (Power & Torque)');
try {
  const peaks = findPeaksForPreset(vestaTestData, 1);
  console.log(`   Expected: 2 peaks (P-Av, Torque)`);
  console.log(`   Result: ${peaks.length} peaks`);
  console.log(`   Peak 1: ${peaks[0].displayLabel} = ${peaks[0].value} at ${peaks[0].rpm} RPM`);
  console.log(`   Peak 2: ${peaks[1].displayLabel} = ${peaks[1].value} at ${peaks[1].rpm} RPM`);
  const pass = peaks.length === 2 &&
    peaks[0].value === 136.10 && peaks[0].rpm === 7400 &&
    peaks[1].value === 189.98 && peaks[1].rpm === 6400;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 6: findPeaksForPreset - Preset 2 (Cylinder Pressure)
console.log('\n✅ Test 6: findPeaksForPreset - Preset 2 (Cylinder Pressure)');
try {
  const peaks = findPeaksForPreset(vestaTestData, 2);
  console.log(`   Expected: 4 peaks (PCylMax for each cylinder)`);
  console.log(`   Result: ${peaks.length} peaks`);
  peaks.forEach((peak, i) => {
    console.log(`   Peak ${i + 1}: ${peak.displayLabel} = ${peak.value} at ${peak.rpm} RPM`);
  });
  const pass = peaks.length === 4 &&
    peaks.every(p => p.value === 94.5 && p.rpm === 6600);
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 7: findPeaksForPreset - Preset 3 (Temperature)
console.log('\n✅ Test 7: findPeaksForPreset - Preset 3 (Temperature)');
try {
  const peaks = findPeaksForPreset(vestaTestData, 3);
  console.log(`   Expected: 2 peaks (TCylMax avg, TUbMax avg)`);
  console.log(`   Result: ${peaks.length} peaks`);
  peaks.forEach((peak, i) => {
    console.log(`   Peak ${i + 1}: ${peak.displayLabel} = ${peak.value.toFixed(1)} at ${peak.rpm} RPM`);
  });
  const pass = peaks.length === 2 &&
    peaks[0].rpm === 6600 &&
    peaks[1].rpm === 6600;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 8: formatPeakValue - SI units
console.log('\n✅ Test 8: formatPeakValue - SI units');
try {
  const peak: PeakValue = {
    value: 136.10,
    rpm: 7400,
    parameter: 'P-Av',
    displayLabel: 'Max P-Av',
  };
  const formatted = formatPeakValue(peak, 'si', 1);
  const expected = '136.1 kW at 7400 RPM';
  console.log(`   Expected: "${expected}"`);
  console.log(`   Result: "${formatted}"`);
  console.log(`   Status: ${formatted === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 9: formatPeakValue - American units (bhp)
console.log('\n✅ Test 9: formatPeakValue - American units (bhp)');
try {
  const peak: PeakValue = {
    value: 136.10,
    rpm: 7400,
    parameter: 'P-Av',
    displayLabel: 'Max P-Av',
  };
  const formatted = formatPeakValue(peak, 'american', 1);
  // 136.10 kW × 1.341 = 182.5 bhp
  const expected = '182.5 bhp at 7400 RPM';
  console.log(`   Expected: "${expected}"`);
  console.log(`   Result: "${formatted}"`);
  console.log(`   Status: ${formatted === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 10: formatPeakValue - HP units (PS)
console.log('\n✅ Test 10: formatPeakValue - HP units (PS)');
try {
  const peak: PeakValue = {
    value: 136.10,
    rpm: 7400,
    parameter: 'P-Av',
    displayLabel: 'Max P-Av',
  };
  const formatted = formatPeakValue(peak, 'hp', 1);
  // 136.10 kW × 1.36 = 185.1 PS
  const expected = '185.1 PS at 7400 RPM';
  console.log(`   Expected: "${expected}"`);
  console.log(`   Result: "${formatted}"`);
  console.log(`   Status: ${formatted === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 11: formatPeakValue - Torque with units
console.log('\n✅ Test 11: formatPeakValue - Torque (American units)');
try {
  const peak: PeakValue = {
    value: 189.98,
    rpm: 6400,
    parameter: 'Torque',
    displayLabel: 'Max Torque',
  };
  const formatted = formatPeakValue(peak, 'american', 1);
  // 189.98 N·m × 0.7376 = 140.2 lb-ft
  const expected = '140.2 lb-ft at 6400 RPM';
  console.log(`   Expected: "${expected}"`);
  console.log(`   Result: "${formatted}"`);
  console.log(`   Status: ${formatted === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 12: Error handling - empty array
console.log('\n✅ Test 12: Error handling - Empty array');
try {
  findPeak([], 'P-Av');
  console.log('   ❌ FAIL - Should have thrown an error');
} catch (error) {
  console.log('   Expected: Error thrown');
  console.log(`   Result: ${(error as Error).message}`);
  console.log('   Status: ✅ PASS');
}

console.log('\n' + '='.repeat(60));
console.log('🎉 All tests completed!\n');
