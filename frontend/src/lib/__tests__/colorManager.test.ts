/**
 * Тесты для Color Manager функций
 *
 * Проверяем правильное назначение цветов для primary и comparison calculations
 */

import {
  getNextColor,
  assignColors,
  getUsedColors,
  canAddComparison,
  getColorIndex,
} from '../colorManager';
import { CALCULATION_COLORS } from '../../types/v2';
import type { CalculationReference } from '../../types/v2';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Создаёт mock CalculationReference для тестирования
 */
function createMockCalc(id: string, color?: string): CalculationReference {
  return {
    projectId: 'test-project',
    projectName: 'Test Project',
    calculationId: id,
    calculationName: id,
    color: color || '',
    metadata: {
      rpmRange: [2000, 7800],
      avgStep: 200,
      pointsCount: 26,
      engineType: 'NATUR',
      cylinders: 4,
    },
  };
}

// ============================================================================
// Tests
// ============================================================================

console.log('🧪 Color Manager Tests\n');
console.log('=' .repeat(60));

// Test 1: getNextColor - первый доступный цвет (cyan)
console.log('\n✅ Test 1: getNextColor - First available (cyan)');
try {
  const usedColors = [CALCULATION_COLORS[0]]; // red used
  const nextColor = getNextColor(usedColors);
  const expected = CALCULATION_COLORS[1]; // cyan
  console.log(`   Used: ["${usedColors[0]}"]`);
  console.log(`   Expected: "${expected}" (cyan)`);
  console.log(`   Result: "${nextColor}"`);
  console.log(`   Status: ${nextColor === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 2: getNextColor - второй доступный цвет (blue)
console.log('\n✅ Test 2: getNextColor - Second available (blue)');
try {
  const usedColors = [CALCULATION_COLORS[0], CALCULATION_COLORS[1]]; // red, cyan used
  const nextColor = getNextColor(usedColors);
  const expected = CALCULATION_COLORS[2]; // blue
  console.log(`   Used: [red, cyan]`);
  console.log(`   Expected: "${expected}" (blue)`);
  console.log(`   Result: "${nextColor}"`);
  console.log(`   Status: ${nextColor === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 3: getNextColor - все цвета использованы (fallback to red)
console.log('\n✅ Test 3: getNextColor - All colors used (fallback)');
try {
  const usedColors = [...CALCULATION_COLORS]; // all colors used
  const nextColor = getNextColor(usedColors);
  const expected = CALCULATION_COLORS[0]; // fallback to red
  console.log(`   Used: [all 5 colors]`);
  console.log(`   Expected: "${expected}" (fallback to red)`);
  console.log(`   Result: "${nextColor}"`);
  console.log(`   Status: ${nextColor === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 4: getNextColor - пустой массив (вернёт первый цвет)
console.log('\n✅ Test 4: getNextColor - Empty array (returns first color)');
try {
  const usedColors: string[] = [];
  const nextColor = getNextColor(usedColors);
  const expected = CALCULATION_COLORS[0]; // red
  console.log(`   Used: []`);
  console.log(`   Expected: "${expected}" (red)`);
  console.log(`   Result: "${nextColor}"`);
  console.log(`   Status: ${nextColor === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 5: assignColors - primary only
console.log('\n✅ Test 5: assignColors - Primary only');
try {
  const primary = createMockCalc('$1');
  const comparisons: CalculationReference[] = [];

  assignColors(primary, comparisons);

  const expected = CALCULATION_COLORS[0]; // red
  console.log(`   Primary before: color="${primary.color}"`);
  console.log(`   Expected: "${expected}" (red)`);
  console.log(`   Primary after: color="${primary.color}"`);
  console.log(`   Status: ${primary.color === expected ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 6: assignColors - primary + 1 comparison
console.log('\n✅ Test 6: assignColors - Primary + 1 comparison');
try {
  const primary = createMockCalc('$1');
  const comp1 = createMockCalc('$2');

  assignColors(primary, [comp1]);

  console.log(`   Primary color: "${primary.color}" (expected: ${CALCULATION_COLORS[0]})`);
  console.log(`   Comp1 color: "${comp1.color}" (expected: ${CALCULATION_COLORS[1]})`);

  const pass = primary.color === CALCULATION_COLORS[0] &&
                comp1.color === CALCULATION_COLORS[1];
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 7: assignColors - primary + 4 comparisons (full)
console.log('\n✅ Test 7: assignColors - Primary + 4 comparisons (full)');
try {
  const primary = createMockCalc('$1');
  const comp1 = createMockCalc('$2');
  const comp2 = createMockCalc('$3');
  const comp3 = createMockCalc('$4');
  const comp4 = createMockCalc('$5');

  assignColors(primary, [comp1, comp2, comp3, comp4]);

  console.log(`   Primary: "${primary.color}" (red)`);
  console.log(`   Comp1: "${comp1.color}" (cyan)`);
  console.log(`   Comp2: "${comp2.color}" (blue)`);
  console.log(`   Comp3: "${comp3.color}" (yellow)`);
  console.log(`   Comp4: "${comp4.color}" (purple)`);

  const pass =
    primary.color === CALCULATION_COLORS[0] &&
    comp1.color === CALCULATION_COLORS[1] &&
    comp2.color === CALCULATION_COLORS[2] &&
    comp3.color === CALCULATION_COLORS[3] &&
    comp4.color === CALCULATION_COLORS[4];

  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 8: assignColors - null primary (только comparisons)
console.log('\n✅ Test 8: assignColors - Null primary');
try {
  const comp1 = createMockCalc('$1');
  const comp2 = createMockCalc('$2');

  assignColors(null, [comp1, comp2]);

  console.log(`   Comp1 color: "${comp1.color}" (expected: ${CALCULATION_COLORS[1]})`);
  console.log(`   Comp2 color: "${comp2.color}" (expected: ${CALCULATION_COLORS[2]})`);

  const pass = comp1.color === CALCULATION_COLORS[1] &&
                comp2.color === CALCULATION_COLORS[2];
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 9: getUsedColors - получение списка использованных цветов
console.log('\n✅ Test 9: getUsedColors');
try {
  const primary = createMockCalc('$1', CALCULATION_COLORS[0]);
  const comp1 = createMockCalc('$2', CALCULATION_COLORS[1]);
  const comp2 = createMockCalc('$3', CALCULATION_COLORS[2]);

  const usedColors = getUsedColors(primary, [comp1, comp2]);

  console.log(`   Primary color: ${primary.color}`);
  console.log(`   Comp colors: [${comp1.color}, ${comp2.color}]`);
  console.log(`   Used colors: [${usedColors.join(', ')}]`);
  console.log(`   Expected length: 3`);
  console.log(`   Result length: ${usedColors.length}`);

  const pass = usedColors.length === 3 &&
    usedColors.includes(CALCULATION_COLORS[0]) &&
    usedColors.includes(CALCULATION_COLORS[1]) &&
    usedColors.includes(CALCULATION_COLORS[2]);

  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 10: canAddComparison - можно добавить (< 4)
console.log('\n✅ Test 10: canAddComparison - Can add (< 4)');
try {
  const comp1 = createMockCalc('$1');
  const comp2 = createMockCalc('$2');

  const canAdd = canAddComparison([comp1, comp2]);

  console.log(`   Current comparisons: 2`);
  console.log(`   Can add more? ${canAdd}`);
  console.log(`   Expected: true`);
  console.log(`   Status: ${canAdd === true ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 11: canAddComparison - нельзя добавить (= 4)
console.log('\n✅ Test 11: canAddComparison - Cannot add (= 4)');
try {
  const comp1 = createMockCalc('$1');
  const comp2 = createMockCalc('$2');
  const comp3 = createMockCalc('$3');
  const comp4 = createMockCalc('$4');

  const canAdd = canAddComparison([comp1, comp2, comp3, comp4]);

  console.log(`   Current comparisons: 4`);
  console.log(`   Can add more? ${canAdd}`);
  console.log(`   Expected: false`);
  console.log(`   Status: ${canAdd === false ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 12: getColorIndex
console.log('\n✅ Test 12: getColorIndex');
try {
  const index0 = getColorIndex(CALCULATION_COLORS[0]);
  const index4 = getColorIndex(CALCULATION_COLORS[4]);
  const indexNotFound = getColorIndex('#000000');

  console.log(`   CALCULATION_COLORS[0] index: ${index0} (expected: 0)`);
  console.log(`   CALCULATION_COLORS[4] index: ${index4} (expected: 4)`);
  console.log(`   #000000 index: ${indexNotFound} (expected: -1)`);

  const pass = index0 === 0 && index4 === 4 && indexNotFound === -1;
  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

// Test 13: Full workflow - добавление расчётов последовательно
console.log('\n✅ Test 13: Full workflow - Sequential addition');
try {
  const primary = createMockCalc('$1');
  const comparisons: CalculationReference[] = [];

  // Assign primary
  assignColors(primary, comparisons);
  console.log(`   Step 1: Primary assigned - ${primary.color}`);

  // Add first comparison
  const comp1 = createMockCalc('$2');
  comparisons.push(comp1);
  assignColors(primary, comparisons);
  console.log(`   Step 2: Comp1 added - ${comp1.color}`);

  // Add second comparison
  const comp2 = createMockCalc('$3');
  comparisons.push(comp2);
  assignColors(primary, comparisons);
  console.log(`   Step 3: Comp2 added - ${comp2.color}`);

  // Check all colors are unique
  const allColors = [primary.color, comp1.color, comp2.color];
  const uniqueColors = new Set(allColors);

  console.log(`   All colors: [${allColors.join(', ')}]`);
  console.log(`   Unique count: ${uniqueColors.size} (expected: 3)`);

  const pass = uniqueColors.size === 3 &&
    primary.color === CALCULATION_COLORS[0] &&
    comp1.color === CALCULATION_COLORS[1] &&
    comp2.color === CALCULATION_COLORS[2];

  console.log(`   Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
} catch (error) {
  console.error('   ❌ ERROR:', error);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 All tests completed!\n');
