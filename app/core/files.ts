import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2Client } from './infra/storage/r2Client.js'
import { prismaClient } from './infra/db/prismaClient.js'
import { fileQueue, cleanupQueue } from './infra/queue/queue.js'
import fs from 'fs'
import config from '../shared/config.js'
import { FileStatus } from '@prisma/client'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
const files: any = {}


export const createBundle = async function (bundleId: string) {
  await prismaClient.bundle.create({
    data: { id: bundleId }
  })
  
}

export const insertFileMetaData = async function (file: any, bundleId: string) {
  
  return prismaClient.file.create({
    data: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: 'PENDING',
      bundleId,
      expiresAt: calculateExpiry()
    }
  })
}

// export interface DbFiles {
//   id: string
// }
export const insertBulkFileMetaData = async (filesData: any)=> {
  // 1. Prepare the data with pre-generated UUIDs
  
  // 2. Perform the Bulk Insert
   return prismaClient.file.createMany({
    data: filesData,
    skipDuplicates: true,
  });

  // // 3. Return the data (including the IDs) to the controller
  // return filesData;
};
export const addFilesToQueueBulk = async (
  files: any, 
  bundleId: string, 
  dbFiles: { id: string }[]
) => {
  // 1. Map your individual file data into an array of Job objects
  const jobs = dbFiles.map((dbFile, index) => {
    const file = files[index];

    return {
      name: 'upload-file',
      data: {
        filePath: file.path,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        bundleId,
        fileId: dbFile.id
      },
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false // keeping failed jobs in queue for debugging as requested
      }
    };
  });

  // 2. Add all jobs to the queue in a single network round-trip to Redis
  return await fileQueue.addBulk(jobs);
};

export async function handleFileUpload(job: any) {
  const { filePath, fileName, mimeType, bundleId, fileId } = job.data

  // const file = await prismaClient.file.findUnique({
  //   where: { id: fileId },
  // });
  // //  Idempotency
  // if (!file || file.status === "COMPLETED") return;

  // const fileBuffer = fs.readFileSync(filePath);
  const fileBuffer = await fs.promises.readFile(filePath)
  const key = `${bundleId}/${fileName}`
  const command = new PutObjectCommand({
    Bucket: config.r2Creds.bucketName,
    Key: key, // folder structure
    Body: fileBuffer,
    ContentType: mimeType
  })
  await prismaClient.file.update({
    where: { id: fileId },
    data: { status: 'UPLOADING' }
  })

  await r2Client.send(command)
  await prismaClient.file.update({
    where: { id: fileId },
    data: {
      status: 'COMPLETED',
      storageKey: key
    }
  })
  console.log(`Uploaded: ${key}`)

  fs.unlinkSync(filePath)
}
const calculateExpiry = () => {
  const hours = Number(process.env.FILE_EXPIRY_HOURS || 24)
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

export async function handleCleanup(job: any) {
  const now = new Date()
  console.log('in handleCleanup function')

  const files = await prismaClient.file.findMany({
    where: {
      status: 'COMPLETED',
      expiresAt: { lte: now }
    }
  })
  for (const file of files) {
    await prismaClient.file.update({
      where: { id: file.id },
      data: { status: FileStatus.EXPIRED }
    })

    await cleanupQueue.add('delete-file', {
      fileId: file.id,
      storageKey: file.storageKey
    })
    console.log('file' + ' ' + file.id + ' queued for deletion')
  }
}
export const handleDeletion = async function (job: any) {
  console.log('in handleDeletion function')

  const { fileId, storageKey } = job.data

  // const file = await prismaClient.file.findUnique({
  //   where: { id: fileId },
  // });

  // //  Idempotency
  // if (!file || file.status === "DELETED") return;

  try {
    if (storageKey) {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: config.r2Creds.bucketName,
          Key: storageKey
        })
      )
    }

    await prismaClient.file.update({
      where: { id: fileId },
      data: {
        status: 'DELETED',
        deletedAt: new Date()
      }
    })
  } catch (err) {
    console.error('Delete failed:', fileId, err)
    throw err // retry via BullMQ
  }
}
export const getDeletedBundlesFromDb = async function () {
  return prismaClient.bundle.findMany({
    where: {
      status: 'DELETED'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          files: {
            where: {
              status: 'DELETED'
            }
          }
        }
      },
      files: {
        where: {
          status: 'DELETED'
        },
        select: {
          status: true
        }
      }
    }
  })
}

export const getBundleData = async function (bundleId: string) {
  return prismaClient.bundle.findUnique({
    where: { id: bundleId },
    include: {
      files: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

// Utility: generate signed URL
export const generateSignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: config.r2Creds.bucketName,
    Key: key
  })

  // expires in 5 minutes
  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 })
  return { url }
}

export default files
