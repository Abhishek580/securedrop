import {Redis} from "ioredis"
import config from "../../../shared/config.js";


export const redisConnection = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null, //  for BullMQ
  });

redisConnection.on("connect", () => {
  console.log("Redis Connected");
});

redisConnection.on("error", (err) => {
  console.log("Redis Error:", err);
});


