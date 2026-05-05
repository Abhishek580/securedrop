import { Worker } from "bullmq";
import { redisConnection } from "../core/adapters/redis.js";
import { handleFileUpload } from "../core/files.js";

const worker = new Worker(
  "file-upload",
  async (job) => {
    await handleFileUpload(job);
  },
  { connection: redisConnection }
);

console.log("Worker started...");

worker.on("completed", (job) => {
  console.log(" Job completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error(" Job failed:", err); 
});

