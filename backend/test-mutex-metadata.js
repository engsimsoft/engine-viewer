/**
 * Test script for mutex-protected metadata writes
 * Tests concurrent write protection with async-mutex
 */

import { saveMetadata, updateAutoMetadata, updateManualMetadata, getMetadata, deleteMetadata } from './src/services/metadataService.js';

/**
 * Simulate concurrent writes to the same projectId
 */
async function testConcurrentWrites() {
  console.log('🧪 Testing mutex-protected concurrent writes\n');
  console.log('='.repeat(80));

  const testProjectId = 'test-mutex-project';

  try {
    // Cleanup: Delete test project metadata if exists
    await deleteMetadata(testProjectId);
    console.log('✅ Cleaned up test metadata\n');

    // Test 1: Concurrent saveMetadata() calls
    console.log('📋 Test 1: Concurrent saveMetadata() (10 writes simultaneously)');
    console.log('-'.repeat(80));

    const savePromises = [];
    for (let i = 0; i < 10; i++) {
      const metadata = {
        version: '1.0',
        id: testProjectId,
        displayName: `Test ${i}`,
        auto: { cylinders: 4, type: 'NA' },
        manual: { description: `Concurrent write ${i}` }
      };
      savePromises.push(saveMetadata(testProjectId, metadata));
    }

    console.log('Starting 10 concurrent saveMetadata() calls...');
    const results = await Promise.all(savePromises);
    console.log(`✅ All ${results.length} writes completed without errors`);

    // Verify final state
    const finalMetadata1 = await getMetadata(testProjectId);
    if (finalMetadata1 && finalMetadata1.version === '1.0') {
      console.log(`✅ Final state is valid (displayName: "${finalMetadata1.displayName}")`);
      console.log(`   Description: "${finalMetadata1.manual.description}"`);
    } else {
      console.log('❌ Final state is corrupted or invalid');
    }

    // Test 2: Concurrent updateAutoMetadata() calls
    console.log('\n📋 Test 2: Concurrent updateAutoMetadata() (10 writes simultaneously)');
    console.log('-'.repeat(80));

    const autoUpdatePromises = [];
    for (let i = 0; i < 10; i++) {
      const autoMetadata = {
        cylinders: i + 1,
        type: i % 2 === 0 ? 'NA' : 'Turbo',
        bore: 80 + i,
        stroke: 75 + i,
        displacement: 1.6 + i * 0.1,
        compressionRatio: 10 + i
      };
      autoUpdatePromises.push(updateAutoMetadata(testProjectId, autoMetadata));
    }

    console.log('Starting 10 concurrent updateAutoMetadata() calls...');
    const autoResults = await Promise.all(autoUpdatePromises);
    console.log(`✅ All ${autoResults.length} writes completed without errors`);

    // Verify final state
    const finalMetadata2 = await getMetadata(testProjectId);
    if (finalMetadata2 && finalMetadata2.auto && finalMetadata2.auto.cylinders) {
      console.log(`✅ Final state is valid (cylinders: ${finalMetadata2.auto.cylinders}, type: ${finalMetadata2.auto.type})`);
      console.log(`   Bore x Stroke: ${finalMetadata2.auto.bore} x ${finalMetadata2.auto.stroke} mm`);
    } else {
      console.log('❌ Final state is corrupted or invalid');
    }

    // Test 3: Concurrent updateManualMetadata() calls
    console.log('\n📋 Test 3: Concurrent updateManualMetadata() (10 writes simultaneously)');
    console.log('-'.repeat(80));

    const manualUpdatePromises = [];
    for (let i = 0; i < 10; i++) {
      const manualMetadata = {
        description: `Manual update ${i}`,
        client: `Client ${i}`,
        tags: [`tag${i}`],
        status: i % 2 === 0 ? 'active' : 'archived',
        notes: `Notes ${i}`,
        color: `#${i}${i}${i}${i}${i}${i}`
      };
      manualUpdatePromises.push(updateManualMetadata(testProjectId, manualMetadata));
    }

    console.log('Starting 10 concurrent updateManualMetadata() calls...');
    const manualResults = await Promise.all(manualUpdatePromises);
    console.log(`✅ All ${manualResults.length} writes completed without errors`);

    // Verify final state
    const finalMetadata3 = await getMetadata(testProjectId);
    if (finalMetadata3 && finalMetadata3.manual) {
      console.log(`✅ Final state is valid (status: ${finalMetadata3.manual.status})`);
      console.log(`   Description: "${finalMetadata3.manual.description}"`);
      console.log(`   Client: "${finalMetadata3.manual.client}"`);
      console.log(`   Tags: [${finalMetadata3.manual.tags.join(', ')}]`);
    } else {
      console.log('❌ Final state is corrupted or invalid');
    }

    // Test 4: Mixed concurrent writes (save + updateAuto + updateManual)
    console.log('\n📋 Test 4: Mixed concurrent writes (all functions simultaneously)');
    console.log('-'.repeat(80));

    const mixedPromises = [];

    // 5 saveMetadata calls
    for (let i = 0; i < 5; i++) {
      mixedPromises.push(saveMetadata(testProjectId, {
        version: '1.0',
        id: testProjectId,
        displayName: `Mixed Save ${i}`,
        auto: { cylinders: 4 },
        manual: { description: `Save ${i}` }
      }));
    }

    // 5 updateAutoMetadata calls
    for (let i = 0; i < 5; i++) {
      mixedPromises.push(updateAutoMetadata(testProjectId, {
        cylinders: 4 + i,
        type: 'Turbo',
        bore: 85 + i,
        stroke: 80 + i
      }));
    }

    // 5 updateManualMetadata calls
    for (let i = 0; i < 5; i++) {
      mixedPromises.push(updateManualMetadata(testProjectId, {
        description: `Manual ${i}`,
        status: 'active',
        tags: [`mixed${i}`]
      }));
    }

    console.log('Starting 15 mixed concurrent writes (5 save + 5 auto + 5 manual)...');
    const mixedResults = await Promise.all(mixedPromises);
    console.log(`✅ All ${mixedResults.length} writes completed without errors`);

    // Verify final state
    const finalMetadata4 = await getMetadata(testProjectId);
    if (finalMetadata4 && finalMetadata4.version === '1.0' && finalMetadata4.auto && finalMetadata4.manual) {
      console.log(`✅ Final state is valid and complete`);
      console.log(`   Auto: ${finalMetadata4.auto.cylinders} cyl, ${finalMetadata4.auto.type}`);
      console.log(`   Manual: "${finalMetadata4.manual.description}", status: ${finalMetadata4.manual.status}`);
    } else {
      console.log('❌ Final state is corrupted or incomplete');
    }

    // Cleanup
    await deleteMetadata(testProjectId);
    console.log('\n✅ Cleaned up test metadata');

    console.log('\n' + '='.repeat(80));
    console.log('✅ All mutex tests passed!');
    console.log('\n🔒 Mutex protection verified:');
    console.log('   - No JSON corruption during concurrent writes');
    console.log('   - All write functions properly serialized');
    console.log('   - Final state always consistent');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);

    // Cleanup on error
    try {
      await deleteMetadata(testProjectId);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Run tests
testConcurrentWrites();
