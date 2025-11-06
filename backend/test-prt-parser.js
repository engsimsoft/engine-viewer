/**
 * Test script for .prt parser
 * Tests parsing of all 4 .prt files in test-data/
 */

import { PrtParser } from './src/parsers/formats/prtParser.js';
import { join, resolve } from 'path';

const parser = new PrtParser();

// Test data directory (from backend/ go up to root, then into test-data/)
const TEST_DATA_DIR = resolve('../test-data');

// .prt files to test
const testFiles = [
  '4_Cyl_ITB.prt',
  'BMW M42.prt',
  'TM Soft ShortCut.prt',
  'Vesta 1.6 IM.prt'
];

async function testPrtParser() {
  console.log('🧪 Testing .prt Parser\n');
  console.log('='.repeat(80));

  for (const fileName of testFiles) {
    try {
      console.log(`\n📄 Testing: ${fileName}`);
      console.log('-'.repeat(80));

      const filePath = join(TEST_DATA_DIR, fileName);
      const result = await parser.parse(filePath);

      console.log('\n✅ PARSED SUCCESSFULLY!');
      console.log('\n📊 Metadata:');
      console.log(`  Project Name:     ${result.engine.name}`);
      console.log(`  Created:          ${result.created}`);
      console.log(`  Dat4T Version:    ${result.datVersion}`);
      console.log(`\n🔧 Engine Specs:`);
      console.log(`  Type:             ${result.engine.type}`);
      console.log(`  Cylinders:        ${result.engine.cylinders}`);
      console.log(`  Configuration:    ${result.engine.configuration}`);
      console.log(`  Bore:             ${result.engine.bore} mm`);
      console.log(`  Stroke:           ${result.engine.stroke} mm`);
      console.log(`  Compression:      ${result.engine.compressionRatio}`);
      console.log(`  Max Power RPM:    ${result.engine.maxPowerRPM}`);
      console.log(`\n💨 Systems:`);
      console.log(`  Intake System:    ${result.engine.intakeSystem}`);
      console.log(`  Valves:           ${result.engine.valvesPerCylinder} (${result.engine.inletValves} In + ${result.engine.exhaustValves} Ex)`);

    } catch (error) {
      console.error(`\n❌ ERROR parsing ${fileName}:`);
      console.error(error);
    }

    console.log('\n' + '='.repeat(80));
  }

  console.log('\n\n✅ All tests complete!');
}

// Run tests
testPrtParser();
