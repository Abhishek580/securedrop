import type { Request, Response } from "express";
import core from "../../core/files.js";

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const file =req.file
      // (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    // console.log("files: ", file);

    if (!file) {
      console.log('no file');
      
      return res.status(400).json({ message: "No file uploaded" });
    }

    const key = await core.uploadToR2(file);
    const savedFile = await core.saveFileMetadata(file, key);

    return res.status(201).json({
      message: "File uploaded successfully",
      fileId: savedFile.id,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      message: "File upload failed",
    });
  }
};
