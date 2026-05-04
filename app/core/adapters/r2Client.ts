import { S3Client } from "@aws-sdk/client-s3";
import config from "../../config.js"
console.log('r2 client created');

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${config.r2Creds.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2Creds.accessKeyId,
    secretAccessKey: config.r2Creds.secretAccessKey,
  },
});