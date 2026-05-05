import type { Request, Response } from "express";
import {
  createBundle,
  insertFileMetaData,
  addFilesToQueue,
} from "../../core/files.js";
import { randomUUID } from "node:crypto";

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const bundleId = randomUUID();
    await createBundle(bundleId);

    await Promise.all(
      files.map(async (file) => {
        // Create file entries (PENDING)
        const dbFile = await insertFileMetaData(file, bundleId);
        //Push files to queue ( include fileId)
        await addFilesToQueue(file, bundleId, dbFile);
      }),
    );
    res.json({
      bundleId,
      message: "Upload started",
    });
  } catch (err) {
    console.error(err);
    console.error("Upload Error:", err);

    res.status(500).json({ message: "Upload failed" });
  }
};
