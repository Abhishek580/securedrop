import { Queue, type QueueOptions } from 'bullmq'
import { redisConnection } from '../cache/redis.js'

const defaultOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true
  }
}

function createQueue(name: string) {
  const queue = new Queue(name, defaultOptions)

  queue.on('error', (err) => console.error(`${name} Error:`, err))
  queue.on('waiting', (jobId) => console.log(`${name}: Job waiting ${jobId}`))

  return queue
}

export const fileQueue = createQueue('file-upload')
export const cleanupQueue = createQueue('file-cleanup')
