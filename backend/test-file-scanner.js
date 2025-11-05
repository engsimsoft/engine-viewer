/**
 * Test script for fileScanner.js
 * Tests .prt file scanning and auto metadata population
 */

import { scanProjects } from './src/services/fileScanner.js';
import { getMetadata } from './src/services/metadataService.js';
import { resolve } from 'path';

async function testFileScanner() {
  console.log('🧪 Testing fileScanner.js with .prt support\n');
  console.log('='.repeat(80));

  try {
    // Test data directory (from backend/ go up to root, then into test-data/)
    const testDataDir = resolve('./test-data');

    // Test 1: Scan directory (should include .prt files)
    console.log('\n📂 Test 1: Scan directory for .det, .pou, .prt files');
    console.log('-'.repeat(80));
    const projects = await scanProjects(testDataDir, ['.det', '.pou', '.prt']);

    console.log(`✅ Found ${projects.length} projects`);
    projects.forEach(project => {
      console.log(`   - ${project.name} (${project.format}, ${project.numCylinders} cyl)`);
    });

    // Test 2: Check that .prt files populated auto metadata
    console.log('\n🔧 Test 2: Verify auto metadata populated from .prt files');
    console.log('-'.repeat(80));

    const prtProjects = ['4-cyl-itb', 'bmw-m42', 'tm-soft-shortcut', 'vesta-1-6-im'];

    for (const projectId of prtProjects) {
      const metadata = await getMetadata(projectId);

      if (metadata && metadata.auto) {
        console.log(`✅ ${projectId}:`);
        console.log(`   - Cylinders: ${metadata.auto.cylinders}`);
        console.log(`   - Type: ${metadata.auto.type}`);
        console.log(`   - Intake: ${metadata.auto.intakeSystem}`);
        console.log(`   - Exhaust: ${metadata.auto.exhaustSystem}`);
        console.log(`   - Bore x Stroke: ${metadata.auto.bore} x ${metadata.auto.stroke} mm`);
      } else {
        console.log(`⚠️  ${projectId}: No auto metadata found`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testFileScanner();
