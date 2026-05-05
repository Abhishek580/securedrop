import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../core/adapters/r2Client.js";
import { prismaClient } from "../core/adapters/prismaClient.js";

export async function handleFileUpload(job: any) {
  const { filePath, fileName, mimeType, bundleId, fileId } = job.data;

  const fileBuffer = fs.readFileSync(filePath);
  const key = `${bundleId}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
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
