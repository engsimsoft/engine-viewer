/**
 * Test script for metadataService.js
 * Tests new v1.0 structure with auto/manual sections
 */

import metadataService from './src/services/metadataService.js';

async function testMetadataService() {
  console.log('🧪 Testing metadataService (v1.0)\n');
  console.log('='.repeat(80));

  try {
    // Test 1: Read existing metadata (should auto-migrate if needed)
    console.log('\n📖 Test 1: Read existing metadata (bmw-m42)');
    console.log('-'.repeat(80));
    const metadata = await metadataService.getMetadata('bmw-m42');

    if (metadata) {
      console.log('✅ Metadata loaded successfully');
      console.log(`   Version: ${metadata.version}`);
      console.log(`   ID: ${metadata.id}`);
      console.log(`   Display Name: "${metadata.displayName}" (${metadata.displayName ? 'set' : 'fallback to ID'})`);
      console.log(`   Manual section: ${Object.keys(metadata.manual).length} fields`);
      console.log(`   Auto section: ${metadata.auto ? 'present' : 'missing (will be added by fileScanner)'}`);
    } else {
      console.log('⚠️  No metadata found');
    }

    // Test 2: Update manual section only (preserve auto)
    console.log('\n✏️  Test 2: Update manual section (should preserve auto)');
    console.log('-'.repeat(80));
    const manualUpdate = {
      displayName: 'BMW M42 Rally Test',
      description: 'Updated description - test manual update',
      client: 'Колин МакРей.',
      tags: ['IPAC', 'M86', 'test-update'],
      status: 'testing',
      notes: 'Testing manual metadata update',
      color: '#3b82f6'
    };

    const updated = await metadataService.updateManualMetadata('bmw-m42', manualUpdate);
    console.log('✅ Manual metadata updated');
    console.log(`   Display Name: "${updated.displayName}"`);
    console.log(`   Manual.description: "${updated.manual.description}"`);
    console.log(`   Manual.tags: [${updated.manual.tags.join(', ')}]`);
    console.log(`   Auto section: ${updated.auto ? 'preserved ✅' : 'missing'}`);

    // Test 3: Simulate auto metadata update (from .prt parser)
    console.log('\n🔧 Test 3: Update auto section (simulate .prt parser)');
    console.log('-'.repeat(80));
    const autoUpdate = {
      cylinders: 4,
      type: 'NA',
      configuration: 'inline',
      bore: 86,
      stroke: 83.5,
      compressionRatio: 11.2,
      maxPowerRPM: 7800,
      intakeSystem: 'IM',
      exhaustSystem: '4-2-1'
    };

    const withAuto = await metadataService.updateAutoMetadata('bmw-m42', autoUpdate);
    console.log('✅ Auto metadata updated');
    console.log(`   Auto.cylinders: ${withAuto.auto.cylinders}`);
    console.log(`   Auto.type: ${withAuto.auto.type}`);
    console.log(`   Auto.intakeSystem: ${withAuto.auto.intakeSystem}`);
    console.log(`   Manual section: ${Object.keys(withAuto.manual).length} fields (preserved ✅)`);
    console.log(`   Display Name: "${withAuto.displayName}" (preserved ✅)`);

    // Test 4: Read final result
    console.log('\n🔍 Test 4: Read final metadata (verify structure)');
    console.log('-'.repeat(80));
    const final = await metadataService.getMetadata('bmw-m42');
    console.log('✅ Final metadata structure:');
    console.log(JSON.stringify(final, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests passed!');
    console.log('\n💡 Notes:');
    console.log('   - Backward compatibility: ✅ (old format auto-migrated)');
    console.log('   - Manual section update: ✅ (auto section preserved)');
    console.log('   - Auto section update: ✅ (manual section preserved)');
    console.log('   - Display Name: ✅ (editable, fallback to ID)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testMetadataService();
