import { Worker, type Job } from 'bullmq'
import { redisConnection } from '../core/infra/cache/redis.js'
import { handleCleanup, handleDeletion } from '../core/files.js'

// Define a type for your job names to prevent typos
type CleanupJobName = 'expire-files' | 'delete-file'

const cleanupWorker = new Worker<any, any, CleanupJobName>(
  'file-cleanup',
  async (job: Job) => {
    // Using a switch statement is cleaner for job name routing
    switch (job.name) {
      case 'expire-files':
        await handleCleanup(job)
        break

      case 'delete-file':
        await handleDeletion(job)
        break

      default:
        console.warn(`Unknown job name received: ${job.name}`)
    }
  },
  {
    connection: redisConnection,
    // Run up to 5 cleanups in parallel so one heavy task doesn't stall the queue
    concurrency: 5,
    // Automatically limit how many logs stay in Redis to save memory
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }
  }
)

// Structured logging
cleanupWorker.on('ready', () => {
  console.log('Cleanup Worker started and connected to Redis')
})

cleanupWorker.on('completed', (job) => {
  console.log(`Job ${job.id} (${job.name}) completed successfully`)
})

cleanupWorker.on('failed', (job, err) => {
  console.error(` Job ${job?.id} failed with error: ${err.message}`)
})

cleanupWorker.on('error', (err) => {
  console.error(' Worker-level connection error:', err)
})

// Graceful shutdown: Ensure worker finishes active jobs before process exits
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Closing worker...`)
  await cleanupWorker.close()
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
