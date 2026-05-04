import multer from "multer";
import config from "../config.js";

const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: config.fileSizeLimit
  },
});
