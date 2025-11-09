/**
 * Test script for cache validation
 * Tests shouldParsePrt() function
 */

import { shouldParsePrt, normalizeFilenameToId } from './src/services/fileScanner.js';
import { saveMetadata } from './src/services/metadataService.js';
import { resolve } from 'path';
import { stat, utimes } from 'fs/promises';

async function testCacheValidation() {
  console.log('🧪 Testing cache validation (shouldParsePrt)\n');
  console.log('='.repeat(80));

  try {
    // Test 1: Metadata doesn't exist → should parse
    console.log('\n📋 Test 1: Metadata missing → should parse');
    console.log('-'.repeat(80));

    const nonExistentProjectId = 'test-non-existent-project-12345';
    const fakePrtPath = './test-data/fake.prt';

    const shouldParse1 = await shouldParsePrt(fakePrtPath, nonExistentProjectId);
    console.log(`Result: ${shouldParse1}`);

    if (shouldParse1 === true) {
      console.log('✅ Correctly identified missing metadata');
    } else {
      console.log('❌ Should return true when metadata missing');
    }

    // Test 2: .prt file is newer than metadata → should parse
    console.log('\n📋 Test 2: .prt file newer than metadata → should parse');
    console.log('-'.repeat(80));

    const prtPath = resolve('../test-data/4_Cyl_ITB.prt');
    const projectId = normalizeFilenameToId('4_Cyl_ITB.prt');

    // Save metadata first (will have current timestamp)
    const testMetadata = {
      version: '1.0',
      id: projectId,
      displayName: 'Test Project',
      auto: {
        cylinders: 4,
        type: 'NA',
        configuration: 'inline',
        bore: 82.5,
        stroke: 75.6,
        displacement: 1.62,
        compressionRatio: 11.3,
        maxPowerRPM: 8000,
        intakeSystem: 'ITB',
        valvesPerCylinder: 4,
        inletValves: 2,
        exhaustValves: 2
      },
      manual: {
        description: '',
        client: '',
        tags: [],
        status: 'active',
        notes: '',
        color: ''
      }
    };

    await saveMetadata(projectId, testMetadata);
    console.log('Saved metadata with current timestamp');

    // Wait a bit then "touch" .prt file to make it newer
    await new Promise(resolve => setTimeout(resolve, 100));

    const futureTime = new Date();
    futureTime.setSeconds(futureTime.getSeconds() + 5); // 5 seconds in future
    await utimes(prtPath, futureTime, futureTime);
    console.log(`Updated .prt mtime to future: ${futureTime.toISOString()}`);

    const shouldParse2 = await shouldParsePrt(prtPath, projectId);
    console.log(`Result: ${shouldParse2}`);

    // Restore original .prt mtime
    const originalPrtStats = await stat(prtPath);
    const originalTime = new Date();
    originalTime.setDate(originalTime.getDate() - 100); // Set back to old time
    await utimes(prtPath, originalTime, originalTime);

    if (shouldParse2 === true) {
      console.log('✅ Correctly identified outdated metadata');
    } else {
      console.log('❌ Should return true when .prt is newer');
    }

    // Test 3: .prt file is older than metadata → should NOT parse
    console.log('\n📋 Test 3: .prt file older than metadata → should skip');
    console.log('-'.repeat(80));

    // Metadata was just saved (current time), .prt is now set to old time → cache should be valid
    console.log('.prt file now has old mtime, metadata has current time');

    const shouldParse3 = await shouldParsePrt(prtPath, projectId);
    console.log(`Result: ${shouldParse3}`);

    if (shouldParse3 === false) {
      console.log('✅ Correctly identified valid cache (metadata newer)');
    } else {
      console.log('❌ Should return false when metadata is newer');
    }

    // Test 4: Real-world test with existing project
    console.log('\n📋 Test 4: Real-world test with actual project');
    console.log('-'.repeat(80));

    const realPrtPath = resolve('../test-data/BMW M42.prt');
    const realProjectId = normalizeFilenameToId('BMW M42.prt');

    const shouldParse4 = await shouldParsePrt(realPrtPath, realProjectId);
    console.log(`Result for "BMW M42": ${shouldParse4}`);

    if (shouldParse4 === false) {
      console.log('✅ Existing project metadata is valid (skipped parsing)');
    } else {
      console.log('⚠️  Either metadata missing or .prt was modified (needs parsing)');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ All cache validation tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testCacheValidation();
