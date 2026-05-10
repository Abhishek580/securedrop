import { cleanupQueue } from "../core/infra/queue/queue.js";

export const startCleanupScheduler = () => {
  console.log("[Scheduler] Cleanup scheduler started (runs every 1 minute)");

  setInterval(async () => {
    const startTime = new Date();

    try {
      console.log(
        `[Scheduler] Triggering expire-files job at ${startTime.toISOString()}`
      );

      const job = await cleanupQueue.add("expire-files", {});

      console.log(
        `[Scheduler] Job added successfully | Job ID: ${job.id}`
      );
 
    } catch (error) {
      console.error(
        `[Scheduler] Failed to enqueue expire-files job`,
        error
      );
    } 
  }, 30 * 1000); // every 1 minute
};