import type { Request, Response } from 'express'
import { createBundle, insertBulkFileMetaData, addFilesToQueueBulk } from '../../core/files.js'
import { randomUUID } from 'node:crypto'

// export const uploadFiles = async (req: Request, res: Response) => {
//   try {
//     const files = req.files as Express.Multer.File[] | undefined;

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }
//     const bundleId = randomUUID();
// await createBundle(bundleId);

//     await Promise.all(
//       files.map(async (file) => {
//         // Create file entries (PENDING)
//         const dbFile = await insertFileMetaData(file, bundleId);
//         //Push files to queue ( include fileId)
//         await addFilesToQueue(file, bundleId, dbFile);
//       }),
//     );
//     res.json({
//       bundleId,
//       message: "Upload started",
//     });
//   } catch (err) {
//     console.error(err);
//     console.error("Upload Error:", err);

//     res.status(500).json({ message: "Upload failed" });
//   }
// };

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined
    if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded' })

    const bundleId = randomUUID()

    // 1. Create the bundle
    await createBundle(bundleId)
    const filesData = files.map((file) => ({
      id: randomUUID(), // Generate locally so we can use it for the queue
      bundleId: bundleId,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      status: 'PENDING' as const
    }))

    // 2. Batch Insert: One DB call instead of 100
    const dbFiles = await insertBulkFileMetaData(filesData)
addFilesToQueueBulk(files, bundleId, filesData)
    // 3. Batch Queue: Most queue systems (like BullMQ) support addBulk
    // If your addFilesToQueue doesn't support bulk, Promise.all is okay here
    // because queue connections (Redis) are much faster than DB writes.
    // await Promise.all(
    //   dbFiles.map((dbFile, index) => addFilesToQueue(files[index], bundleId, dbFile))
    // )

    res.json({ bundleId, message: 'Upload started' })
  } catch (err) {
    console.error('Upload Error:', err)
    res.status(500).json({ message: 'Upload failed' })
  }
}
