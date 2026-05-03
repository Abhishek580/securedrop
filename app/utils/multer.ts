import multer, { type FileFilterCallback } from "multer";
import fs from "node:fs";
import path from "node:path";
import { type Request } from "express";
import { randomUUID } from "node:crypto"; // More explicit for TS
import config from "../config.js";

const uploadDir = config.fileUploadPath 

// Ensuring that the directory exists at startup
if (!fs.existsSync(uploadDir)) {
  
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Standardizing the filename for the "Vault"
    const uniqueId = randomUUID();
    const ext = path.extname(file.originalname);

    // Using a template literal for cleanliness
    cb(null, `vault-${uniqueId}${ext}`);
  },
});

// File filter logic
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  // For a File Vault, we might want more than just images.
  // Allowing images, PDFs, and ZIPs for now.
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/zip",
  ];
 
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Passing an Error to the callback is the standard way to reject in Multer
    cb(new Error(`File type ${file.mimetype} is not supported.`));
  }
};

export const multerUpload = multer({
  storage,
  fileFilter,
  // limits: {
  //   fileSize: 1024 * 1024 * 100, // 100MB 
  //   files: 1, // Only 1 file per request for better control
  // },
});

