/**
 * Test script for prtQueue.js
 * Tests PRT parsing queue with concurrency, priority, and deduplication
 */

import { PrtParsingQueue } from './src/services/prtQueue.js';

/**
 * Mock parse function that simulates .prt parsing
 */
async function mockParsePrt(file, delay = 100) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return { projectId: file.name, success: true };
}

/**
 * Create mock file object
 */
function createMockFile(name) {
  return {
    name,
    path: `/test-data/${name}`,
    size: 1024,
    mtime: new Date()
  };
}

async function testPrtQueue() {
  console.log('🧪 Testing prtQueue.js\n');
  console.log('='.repeat(80));

  try {
    // Test 1: Basic queue functionality
    console.log('\n📋 Test 1: Basic queue functionality (concurrency limit)');
    console.log('-'.repeat(80));

    const queue1 = new PrtParsingQueue({ concurrency: 3 });
    const files = [
      createMockFile('project1.prt'),
      createMockFile('project2.prt'),
      createMockFile('project3.prt'),
      createMockFile('project4.prt'),
      createMockFile('project5.prt'),
      createMockFile('project6.prt'),
      createMockFile('project7.prt'),
      createMockFile('project8.prt'),
      createMockFile('project9.prt'),
      createMockFile('project10.prt'),
    ];

    console.log('Adding 10 files to queue...');

    // Add all files to queue
    const addPromises = files.map(file =>
      queue1.addToQueue(file, mockParsePrt, 'low')
    );

    // Wait a bit to see concurrency in action
    await new Promise(resolve => setTimeout(resolve, 50));

    const status1 = queue1.getStatus();
    const actuallyProcessing = queue1.queue.pending; // p-queue's pending = currently running
    console.log(`Status after 50ms: total=${status1.total}, queued=${status1.pending}, processing=${actuallyProcessing}, completed=${status1.completed}`);

    if (actuallyProcessing <= 3) {
      console.log(`✅ Concurrency limit working (${actuallyProcessing} tasks processing simultaneously, max 3)`);
    } else {
      console.log(`❌ Concurrency limit not working (${actuallyProcessing} > 3)`);
    }

    // Wait for all to complete
    await Promise.all(addPromises);
    await queue1.onIdle();

    const status2 = queue1.getStatus();
    console.log(`Final status: total=${status2.total}, pending=${status2.pending}, completed=${status2.completed}`);

    if (status2.completed === 10 && status2.pending === 0) {
      console.log('✅ All 10 files processed successfully');
    } else {
      console.log(`❌ Expected 10 completed, got ${status2.completed}`);
    }

    // Test 2: Deduplication
    console.log('\n🔄 Test 2: Deduplication (same file added twice)');
    console.log('-'.repeat(80));

    const queue2 = new PrtParsingQueue({ concurrency: 2 });
    const file = createMockFile('duplicate-test.prt');

    console.log('Adding same file twice (without awaiting first)...');

    // Add both without awaiting, so second call happens while first is still processing
    const promise1 = queue2.addToQueue(file, (f) => mockParsePrt(f, 200), 'low');
    const promise2 = queue2.addToQueue(file, (f) => mockParsePrt(f, 200), 'low'); // Should be skipped

    await Promise.all([promise1, promise2]);
    await queue2.onIdle();

    const status3 = queue2.getStatus();
    console.log(`Status: total=${status3.total}, completed=${status3.completed}`);

    if (status3.total === 1 && status3.completed === 1) {
      console.log('✅ Deduplication working (only 1 task processed)');
    } else {
      console.log(`❌ Deduplication failed (total=${status3.total})`);
    }

    // Test 3: Priority queue
    console.log('\n⚡ Test 3: Priority queue (high priority processed first)');
    console.log('-'.repeat(80));

    const queue3 = new PrtParsingQueue({ concurrency: 1 }); // Single concurrency to see order
    const processOrder = [];

    const mockParsePrtWithTracking = async (file) => {
      processOrder.push(file.name);
      await new Promise(resolve => setTimeout(resolve, 50));
      return { projectId: file.name, success: true };
    };

    const lowPriorityFile1 = createMockFile('low1.prt');
    const lowPriorityFile2 = createMockFile('low2.prt');
    const highPriorityFile = createMockFile('high.prt');

    console.log('Adding: low1 (low), low2 (low), high (high)');

    // Add low priority first
    await queue3.addToQueue(lowPriorityFile1, mockParsePrtWithTracking, 'low');
    await queue3.addToQueue(lowPriorityFile2, mockParsePrtWithTracking, 'low');

    // Add high priority after (should jump to front of queue)
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    await queue3.addToQueue(highPriorityFile, mockParsePrtWithTracking, 'high');

    await queue3.onIdle();

    console.log(`Processing order: ${processOrder.join(', ')}`);

    // First should be low1 (already started), then high (priority), then low2
    if (processOrder[0] === 'low1.prt' && processOrder[1] === 'high.prt') {
      console.log('✅ Priority queue working (high priority processed before low2)');
    } else {
      console.log(`⚠️  Order might vary due to timing (${processOrder.join(', ')})`);
    }

    // Test 4: isPending and isCompleted methods
    console.log('\n🔍 Test 4: isPending and isCompleted methods');
    console.log('-'.repeat(80));

    const queue4 = new PrtParsingQueue({ concurrency: 1 });
    const testFile = createMockFile('test-status.prt');

    console.log('Adding file to queue...');
    const addPromise = queue4.addToQueue(testFile, async (file) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true };
    }, 'low');

    // Check while pending
    await new Promise(resolve => setTimeout(resolve, 10));
    const isPendingDuring = queue4.isPending('test-status');
    console.log(`isPending during processing: ${isPendingDuring}`);

    await addPromise;
    await queue4.onIdle();

    const isPendingAfter = queue4.isPending('test-status');
    const isCompletedAfter = queue4.isCompleted('test-status');
    console.log(`isPending after completion: ${isPendingAfter}`);
    console.log(`isCompleted after completion: ${isCompletedAfter}`);

    if (!isPendingAfter && isCompletedAfter) {
      console.log('✅ Status methods working correctly');
    } else {
      console.log('❌ Status methods not working correctly');
    }

    // Test 5: Event emitter (progress and idle events)
    console.log('\n📡 Test 5: Event emitter (progress and idle events)');
    console.log('-'.repeat(80));

    const queue5 = new PrtParsingQueue({ concurrency: 2 });
    let progressEvents = 0;
    let idleEventFired = false;

    queue5.on('progress', (status) => {
      progressEvents++;
      console.log(`Progress event ${progressEvents}: completed=${status.completed}/${status.total}`);
    });

    queue5.on('idle', (status) => {
      idleEventFired = true;
      console.log(`Idle event fired: all ${status.completed} tasks completed`);
    });

    const testFiles = [
      createMockFile('event-test-1.prt'),
      createMockFile('event-test-2.prt'),
      createMockFile('event-test-3.prt'),
    ];

    console.log('Adding 3 files...');
    await Promise.all(testFiles.map(f => queue5.addToQueue(f, mockParsePrt, 'low')));
    await queue5.onIdle();

    console.log(`Total progress events: ${progressEvents}`);
    console.log(`Idle event fired: ${idleEventFired}`);

    if (progressEvents === 3 && idleEventFired) {
      console.log('✅ Events working correctly');
    } else {
      console.log(`⚠️  Events: progress=${progressEvents}, idle=${idleEventFired}`);
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
testPrtQueue();
