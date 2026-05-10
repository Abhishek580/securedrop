import { cleanupQueue } from '../core/infra/queue/queue.js'

/**
 * Converts milliseconds into a human-readable string (e.g., 2h, 15m, 30s)
 */
const formatDuration = (ms: number): string => {
  const timeMap = [
    { unit: 'h', value: 3600000 },
    { unit: 'm', value: 60000 },
    { unit: 's', value: 1000 }
  ]

  for (const { unit, value } of timeMap) {
    if (ms >= value) {
      const amount = Math.floor(ms / value)
      const remainder = ms % value
      // Recursively add smaller units if there is a remainder (e.g., "1h 30m")
      return `${amount}${unit}${remainder >= 1000 ? ' ' + formatDuration(remainder) : ''}`
    }
  }
  return `${ms}ms`
}

/**
 * Registers recurring maintenance tasks.
 * This should be called once when the server starts.
 */
export const registerCleanupJobs = async (duration = 60 * 60 * 1000) => {
  try {
    await cleanupQueue.add(
      'expire-files',
      {}, // No specific data needed for a global cleanup
      {
        repeat: { every: duration },
        jobId: 'expire-files-job', // Crucial: prevents duplicate schedulers
        removeOnComplete: true // Cleanup the history of successful ticks
      }
    )
    const time = formatDuration(duration)
    console.log(`[Scheduler] Repeatable 'expire-files' job registered (Every ${time} sec)`)
  } catch (error) {
    console.error('[Scheduler] Failed to register cleanup job:', error)
  }
}
