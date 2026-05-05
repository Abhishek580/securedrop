import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./adapters/r2Client.js";
import { prismaClient } from "./adapters/prismaClient.js";
import { fileQueue } from "../workers/queue.js";
import fs from "fs";
import config from "../config.js"

const files: any = {};

export const createBundle = async function (bundleId: string) {
  await prismaClient.bundle.create({
    data: { id: bundleId },
  });
};
export const insertFileMetaData = async function (file: any, bundleId: string) {
  return prismaClient.file.create({
    data: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: "PENDING",
      bundleId,
    },
  });
};

export const addFilesToQueue = async function (file: any, bundleId: string,dbFile: any) {
  await fileQueue.add("upload-file", {
          filePath: file.path,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          bundleId,
          fileId: dbFile.id,
        });
};

export async function handleFileUpload(job: any) {
  const { filePath, fileName, mimeType, bundleId, fileId } = job.data;

  const fileBuffer = fs.readFileSync(filePath);
  const key = `${bundleId}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: config.r2Creds.bucketName,
    Key: key, // folder structure
    Body: fileBuffer,
    ContentType: mimeType,
  });
  await prismaClient.file.update({
    where: { id: fileId },
    data: { status: "UPLOADING" },
  });

  await r2Client.send(command);
  await prismaClient.file.update({
    where: { id: fileId },
    data: {
      status: "COMPLETED",
      storageKey: key,
    },
  });
  console.log(`Uploaded: ${key}`);

  fs.unlinkSync(filePath);
}

export default files;
