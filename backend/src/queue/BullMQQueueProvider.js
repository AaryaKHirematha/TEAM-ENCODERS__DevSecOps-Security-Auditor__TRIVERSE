const IQueueProvider = require('./IQueueProvider');
const { jobEvents } = require('../events/JobEvents');

class BullMQQueueProvider extends IQueueProvider {
  constructor(name = 'scan-queue', redisOptions = {}) {
    super();
    this.name = name;
    this.redisOptions = redisOptions;
    this.queue = null;
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const { Queue } = require('bullmq');
      const IORedis = require('ioredis');
      
      const connection = this.redisOptions.url 
        ? new IORedis(this.redisOptions.url, { maxRetriesPerRequest: null, family: 4, tls: { rejectUnauthorized: false } })
        : { ...this.redisOptions, maxRetriesPerRequest: null, family: 4, tls: { rejectUnauthorized: false } };

      this.queue = new Queue(this.name, { connection });
      this.isInitialized = true;
    } catch (err) {
      console.warn(`[BullMQQueueProvider] Redis/BullMQ unavailable (${err.message}). Queue provider disabled.`);
      this.isInitialized = false;
    }
  }

  async enqueue(jobType, payload, options = {}) {
    if (!this.isInitialized || !this.queue) {
      throw new Error('BullMQ queue provider is not initialized or Redis is unreachable');
    }
    const job = await this.queue.add(jobType, payload, options);
    jobEvents.emitCreated({ id: job.id, name: jobType, data: payload });
    return { id: job.id, jobId: job.id, name: jobType, data: payload, status: 'QUEUED' };
  }

  process(jobType, handler, options = {}) {
    console.log('[BullMQQueueProvider] process() called with jobType:', jobType, 'typeof handler:', typeof handler);
    const { Worker } = require('bullmq');
    const IORedis = require('ioredis');
    
    const connection = this.redisOptions.url 
      ? new IORedis(this.redisOptions.url, { maxRetriesPerRequest: null, family: 4, tls: { rejectUnauthorized: false } })
      : { ...this.redisOptions, maxRetriesPerRequest: null, family: 4, tls: { rejectUnauthorized: false } };

    this.worker = new Worker(this.name, async (job) => {
      jobEvents.emitStarted({ id: job.id, name: job.name, data: job.data });
      return await handler(job.data);
    }, { connection, concurrency: options.concurrency || 4 });

    this.worker.on('completed', (job, result) => {
      jobEvents.emitCompleted({ id: job.id }, result);
    });

    this.worker.on('failed', (job, err) => {
      jobEvents.emitFailed({ id: job.id }, err);
    });

    this.worker.on('error', (err) => console.error('[BullMQ Worker Error]', err));
  }

  async getJob(jobId) {
    if (!this.queue) return null;
    const job = await this.queue.getJob(jobId);
    if (!job) return null;
    const state = await job.getState();
    return { id: job.id, jobId: job.id, status: state.toUpperCase(), data: job.data };
  }

  async removeJob(jobId) {
    if (!this.queue) return false;
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  }

  async getStats() {
    if (!this.queue) return { name: this.name, status: 'disabled' };
    const counts = await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    return {
      name: this.name,
      queued: counts.waiting,
      running: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    };
  }

  async close() {
    if (this.worker) await this.worker.close();
    if (this.queue) await this.queue.close();
  }
}

module.exports = BullMQQueueProvider;
