const InMemoryQueueProvider = require('../queue/InMemoryQueueProvider');
const PrioritySchedulingStrategy = require('../jobs/PrioritySchedulingStrategy');
const RetryPolicy = require('../jobs/RetryPolicy');
const { handleJobExecution } = require('./executors/jobExecutor');

const queueProvider = new InMemoryQueueProvider('scan-queue', {
  concurrency: 4,
  schedulingStrategy: new PrioritySchedulingStrategy(),
  failurePolicy: new RetryPolicy()
});

// We need an executor to process scans asynchronously
queueProvider.process('scan', async (job) => {
  return await handleJobExecution(job);
});

module.exports = queueProvider;
