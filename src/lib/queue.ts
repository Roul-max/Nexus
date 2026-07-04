import { Queue, Worker, Job } from 'bullmq';
import { redis } from './redis';

// Note: BullMQ requires a real Redis connection to work. 
// If UPSTASH_REDIS_REST_URL is used, it might not work perfectly with BullMQ because BullMQ expects a standard Redis connection (ioredis).
// For a production setup, it's recommended to have a direct Redis connection string (e.g., REDIS_URL) for BullMQ.

const connectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const emailQueue = new Queue('email-queue', { 
  connection: connectionOptions 
});

export const reportQueue = new Queue('report-queue', { 
  connection: connectionOptions 
});

// Worker setup should ideally be in a separate process/server
// We define it here for structural completeness as requested.
export const setupWorkers = () => {
  if (process.env.NODE_ENV !== 'production' && !process.env.ENABLE_WORKERS) {
    return;
  }

  const emailWorker = new Worker('email-queue', async (job: Job) => {
    console.log(`Processing email job ${job.id}`);
    // Implement email sending logic here
  }, { connection: connectionOptions });

  const reportWorker = new Worker('report-queue', async (job: Job) => {
    console.log(`Processing report job ${job.id}`);
    // Implement report generation logic here
  }, { connection: connectionOptions });

  emailWorker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  emailWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
  });
};
