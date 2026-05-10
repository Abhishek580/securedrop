const config: any = {};
import constants from "./constants.js";
import dotenv from "dotenv";

dotenv.config();

// console.log(process.env);
const ENV = process.env;

config.fileUploadPath = constants.FILE_UPLOAD_PATH;

config.r2Creds= {
  accountId: ENV.R2_ACCOUNT_ID,
  accessKeyId: ENV.R2_ACCESS_KEY,
  secretAccessKey: ENV.R2_SECRET_KEY,
  bucketName:ENV.R2_BUCKET_NAME
};

config.dbUrl = ENV.DATABASE_URL
config.fileSizeLimit = ENV.FILE_SIZE_LIMIT 
config.redisUrl = ENV.REDIS_URL 

export default config;
