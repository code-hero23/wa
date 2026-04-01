require('dotenv').config();
const IORedis = require('ioredis');
const { Queue } = require('bullmq');

async function checkQueue() {
  const connection = new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
  });

  const queue = new Queue('messages', { connection });

  try {
    const counts = await queue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
    console.log('Job Counts:', JSON.stringify(counts, null, 2));

    const active = await queue.getActive();
    console.log('Active Jobs:', active.length);

    const failed = await queue.getFailed();
    console.log('Failed Jobs (last 5):', failed.slice(-5).map(j => ({ id: j.id, data: j.data, failedReason: j.failedReason })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkQueue();
