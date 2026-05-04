import {Redis} from "ioredis"
import config from "../../config.js";
export const client = new Redis(config.redisUrl);

