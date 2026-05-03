import type { Request, Response, NextFunction } from "express";
import mappers from "../../mappers/files/uploadFiles.js";
const addFiles = async function (
  req: Request,
  res: Response,
): Promise<Response | void> {
  try {
    const files =
      (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    // Map response 
    const uploadedFiles = mappers.cleanOutput(files);

    return res.status(200).json({
      message: "Files uploaded successfully",
      count: uploadedFiles.length,
      files: uploadedFiles,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error adding files",
      error: err.message,
    });
  }
};

export default addFiles;
