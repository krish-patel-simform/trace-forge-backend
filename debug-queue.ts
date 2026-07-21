import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

async function checkQueue() {
  const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  const eventQueue = new Queue('events', { connection });

  const waiting = await eventQueue.getWaitingCount();
  const active = await eventQueue.getActiveCount();
  const failed = await eventQueue.getFailedCount();
  const completed = await eventQueue.getCompletedCount();
  
  console.log(`Waiting: ${waiting}, Active: ${active}, Failed: ${failed}, Completed: ${completed}`);

  const failedJobs = await eventQueue.getFailed(0, 5);
  for (const job of failedJobs) {
    console.log(`Failed job ${job.id}: ${job.failedReason}`);
  }

  process.exit(0);
}

checkQueue().catch(console.error);
