import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./adapters/r2Client.js";
import { prismaClient } from "./adapters/prismaClient.js";
import { fileQueue } from "../workers/queue.js";

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
export default files;
