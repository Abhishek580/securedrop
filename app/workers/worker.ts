import { Worker, type Job } from "bullmq";
import { redisConnection } from "../core/infra/cache/redis.js";
import { handleFileUpload } from "../core/files.js";

/**
 * File Upload Worker
 * Handles the actual processing/moving of files to cloud storage or final destination.
 */
const fileWorker = new Worker(
  "file-upload",
  async (job: Job) => {
    // It's good practice to log which file is being processed
    console.log(`Processing file upload: ${job.id} - ${job.data.fileName || 'unknown'}`);
    
    // Pass the job to your core logic
    await handleFileUpload(job);
  },
  { 
    connection: redisConnection,
    // CRITICAL for file uploads: process multiple files in parallel
    // Adjust this based on your server's RAM and Bandwidth
    concurrency: 3, 
    // Optimization: Don't keep every successful upload in Redis memory forever
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
  }
);

// Logging & Monitoring
fileWorker.on("ready", () => {
  console.log("File Upload Worker is online and waiting for jobs...");
});

fileWorker.on("completed", (job) => {
  console.log(`Upload Complete: Job ${job.id}`);
});

// Capture detailed failure info for debugging
fileWorker.on("failed", (job, err) => {
  console.error(`Upload Failed: Job ${job?.id}. Reason: ${err.message}`);
});

// Connection-level errors (e.g., Redis goes down)
fileWorker.on("error", (err) => {
  console.error("Critical Worker Error:", err);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("Shutting down worker...");
  await fileWorker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);