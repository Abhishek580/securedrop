import { Queue } from "bullmq";
import { redisConnection } from "../core/adapters/redis.js";

export const fileQueue = new Queue("file-upload", {
  connection: redisConnection,
});