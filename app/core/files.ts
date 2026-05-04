import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./adapters/r2Client.js";
import { prismaClient } from "./adapters/prismaClient.js";
import config from "../config.js"
// console.log(config);


const files: any = {};

files.uploadToR2 = async function (file: Express.Multer.File)  {
  const key = `uploads/${Date.now()}-${file.originalname}`;
const obj = {
      Bucket:config.r2Creds.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }
    // console.log(obj);
    
  await r2Client.send(
    new PutObjectCommand(obj),
  );

  return key;
};


files.saveFileMetadata = async function (
  file: Express.Multer.File,
  key: string
)  {
  return prismaClient.file.create({
    data: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey: key,
    },
  });
};

export default files;
