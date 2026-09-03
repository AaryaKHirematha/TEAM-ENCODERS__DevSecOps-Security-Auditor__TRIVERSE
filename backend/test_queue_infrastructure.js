const assert = require('assert');
const { queueService } = require('./src/queue/QueueService');
const { jobEvents } = require('./src/events/JobEventEmitter');

async function testQueueInfrastructure() {
  console.log('🧪 Testing Queue Infrastructure...\n');

  const queue = queueService.getQueue('test-scan-queue', { concurrency: 2 });
  assert(queue, 'Queue instance should be created');

  let jobQueuedFired = false;
  let jobStartedFired = false;
  let jobCompletedFired = false;

  jobEvents.on('job:queued', () => { jobQueuedFired = true; });
  jobEvents.on('job:started', () => { jobStartedFired = true; });
  jobEvents.on('job:completed', () => { jobCompletedFired = true; });

  // Test 1: Priority Enqueuing & Delayed Execution
  console.log('Test 1: Enqueuing Priority Jobs');
  const job1 = await queue.add('scan', { target: 'low-priority' }, { priority: 1, jobId: 'job_low' });
  const job2 = await queue.add('scan', { target: 'high-priority' }, { priority: 10, jobId: 'job_high' });

  assert.strictEqual(job1.id, 'job_low');
  assert.strictEqual(job2.id, 'job_high');
  assert(jobQueuedFired, 'job:queued event should be fired');
  console.log('   ✅ Enqueued 2 jobs with priority.\n');

  // Test 2: Worker Processing & Execution
  console.log('Test 2: Worker Processing');
  const executedOrder = [];

  queue.process(async (job) => {
    executedOrder.push(job.id);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { status: 'success', target: job.data.target };
  }, { concurrency: 2 });

  await new Promise((resolve) => setTimeout(resolve, 200));

  assert.strictEqual(executedOrder.length, 2);
  assert.strictEqual(executedOrder[0], 'job_high', 'High priority job should run first');
  assert(jobStartedFired, 'job:started event should be fired');
  assert(jobCompletedFired, 'job:completed event should be fired');

  console.log('   Execution order:', executedOrder);
  console.log('   ✅ Worker processing & priority sorting verified.\n');

  // Test 3: Queue Metrics & Stats
  console.log('Test 3: Queue Metrics & Utilization');
  const stats = await queue.getStats();
  console.log('   Stats:', JSON.stringify(stats));
  assert.strictEqual(stats.completed, 2);
  assert.strictEqual(stats.failed, 0);
  console.log('   ✅ Stats & metrics verified.\n');

  await queueService.closeAll();
  console.log('🎉 QUEUE INFRASTRUCTURE TESTS PASSED!');
}

testQueueInfrastructure().catch((err) => {
  console.error('❌ Queue test failed:', err);
  process.exit(1);
});
