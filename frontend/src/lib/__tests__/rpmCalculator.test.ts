/**
 * Тесты для RPM Calculator функций
 *
 * Проверяем работу calculateAverageStep и formatRPMRange
 * с реальными данными из Vesta 1.6 IM.det
 */

import { calculateAverageStep, formatRPMRange, extractRPMRange } from '../rpmCalculator';
import type { DataPoint } from '../../types/index';

// ============================================================================
// Test Data - Реальные данные из Vesta 1.6 IM.det (первые 10 точек)
// ============================================================================

const vestaDataPoints: Partial<DataPoint>[] = [
  { RPM: 2600 },
  { RPM: 2800 },
  { RPM: 3000 },
  { RPM: 3200 },
  { RPM: 3400 },
  { RPM: 3600 },
  { RPM: 3800 },
  { RPM: 4000 },
  { RPM: 4200 },
  { RPM: 4400 },
];

const vestaFullDataPoints: DataPoint[] = [
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
    RPM: 2800,
    'P-Av': 41.92,
    Torque: 142.97,
    PurCyl: [0.9483, 0.9483, 0.9483, 0.9484],
    TUbMax: [673.0, 673.4, 673.3, 672.9],
    TCylMax: [2368.1, 2368.4, 2368.4, 2368.2],
    PCylMax: [71.0, 70.9, 70.9, 71.0],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 3000,
    'P-Av': 44.85,
    Torque: 142.78,
    PurCyl: [0.9670, 0.9670, 0.9671, 0.9671],
    TUbMax: [644.5, 644.1, 643.8, 644.0],
    TCylMax: [2386.4, 2386.1, 2385.7, 2385.9],
    PCylMax: [70.4, 70.4, 70.4, 70.4],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
  {
    RPM: 7800,
    'P-Av': 135.81,
    Torque: 166.27,
    PurCyl: [0.9853, 0.9853, 0.9853, 0.9853],
    TUbMax: [705.3, 705.2, 703.8, 705.1],
    TCylMax: [2398.8, 2399.7, 2398.4, 2399.9],
    PCylMax: [88.0, 88.0, 88.1, 88.1],
    Deto: [0, 0, 0, 0],
    Convergence: 0,
  },
];

// ============================================================================
// Tests
// ============================================================================

console.log('🧪 RPM Calculator Tests\n');
console.log('=' .repeat(60));

// Test 1: calculateAverageStep с равномерным шагом (200)
console.log('\n✅ Test 1: calculateAverageStep - Uniform step (200 RPM)');
try {
  const avgStep = calculateAverageStep(vestaDataPoints as DataPoint[]);
  console.log(`   Input: RPM values from 2600 to 4400 (step 200)`);
  console.log(`   Expected: 200`);
  console.log(`   Result: ${avgStep}`);
  console.log(`   Status: ${avgStep === 200 ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 2: calculateAverageStep с неравномерным шагом
console.log('\n✅ Test 2: calculateAverageStep - Non-uniform step (should round)');
try {
  const irregularData: Partial<DataPoint>[] = [
    { RPM: 2000 },
    { RPM: 2170 },  // +170
    { RPM: 2360 },  // +190
    { RPM: 2540 },  // +180
    { RPM: 2730 },  // +190
  ];
  // Average: (170 + 190 + 180 + 190) / 4 = 182.5 → rounds to 200
  const avgStep = calculateAverageStep(irregularData as DataPoint[]);
  console.log(`   Input: RPM steps [170, 190, 180, 190]`);
  console.log(`   Average: 182.5`);
  console.log(`   Expected: 200 (rounded to nearest 50)`);
  console.log(`   Result: ${avgStep}`);
  console.log(`   Status: ${avgStep === 200 ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 3: calculateAverageStep с маленьким шагом (должно округлиться до 150)
console.log('\n✅ Test 3: calculateAverageStep - Small step (should round to 150)');
try {
  const smallStepData: Partial<DataPoint>[] = [
    { RPM: 2000 },
    { RPM: 2140 },  // +140
    { RPM: 2290 },  // +150
    { RPM: 2450 },  // +160
  ];
  // Average: (140 + 150 + 160) / 3 = 150 → rounds to 150
  const avgStep = calculateAverageStep(smallStepData as DataPoint[]);
  console.log(`   Input: RPM steps [140, 150, 160]`);
  console.log(`   Average: 150`);
  console.log(`   Expected: 150`);
  console.log(`   Result: ${avgStep}`);
  console.log(`   Status: ${avgStep === 150 ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 4: formatRPMRange
console.log('\n✅ Test 4: formatRPMRange');
try {
  const formatted = formatRPMRange([2600, 7800], 200);
  const expected = '2600-7800 RPM • ~200 RPM step';
  console.log(`   Input: rpmRange=[2600, 7800], avgStep=200`);
  console.log(`   Expected: "${expected}"`);
  console.log(`   Result: "${formatted}"`);
  console.log(`   Status: ${formatted === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 5: extractRPMRange
console.log('\n✅ Test 5: extractRPMRange');
try {
  const rpmRange = extractRPMRange(vestaFullDataPoints);
  const expectedMin = 2600;
  const expectedMax = 7800;
  console.log(`   Input: DataPoints with RPM from 2600 to 7800`);
  console.log(`   Expected: [${expectedMin}, ${expectedMax}]`);
  console.log(`   Result: [${rpmRange[0]}, ${rpmRange[1]}]`);
  const pass = rpmRange[0] === expectedMin && rpmRange[1] === expectedMax;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 6: Error handling - empty array
console.log('\n✅ Test 6: Error handling - Empty array');
try {
  calculateAverageStep([]);
  console.log('   ❌ FAIL - Should have thrown an error');
} catch (error) {
  console.log('   Expected: Error thrown');
  console.log(`   Result: ${(error as Error).message}`);
  console.log('   Status: ✅ PASS');
}

// Test 7: Error handling - single data point
console.log('\n✅ Test 7: Error handling - Single data point');
try {
  calculateAverageStep([{ RPM: 2000 }] as DataPoint[]);
  console.log('   ❌ FAIL - Should have thrown an error');
} catch (error) {
  console.log('   Expected: Error thrown');
  console.log(`   Result: ${(error as Error).message}`);
  console.log('   Status: ✅ PASS');
}

// Test 8: Полный workflow - создание CalculationReference metadata
console.log('\n✅ Test 8: Full workflow - CalculationReference metadata creation');
try {
  const rpmRange = extractRPMRange(vestaFullDataPoints);
  const avgStep = calculateAverageStep(vestaFullDataPoints);
  const formattedRange = formatRPMRange(rpmRange, avgStep);

  console.log('   Creating CalculationReference metadata:');
  console.log(`   - rpmRange: [${rpmRange[0]}, ${rpmRange[1]}]`);
  console.log(`   - avgStep: ${avgStep}`);
  console.log(`   - formatted: "${formattedRange}"`);
  console.log(`   - pointsCount: ${vestaFullDataPoints.length}`);

  const metadata = {
    rpmRange,
    avgStep,
    pointsCount: vestaFullDataPoints.length,
    engineType: 'NATUR',
    cylinders: 4,
  };

  console.log('\n   Full metadata object:');
  console.log('   ', JSON.stringify(metadata, null, 2).split('\n').join('\n    '));
  console.log('   Status: ✅ PASS');
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 All tests completed!\n');
