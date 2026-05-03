import fs from "fs";
import path from "path";
import type { Request, Response } from "express";

const deleteFile = (req: Request, res: Response): any | void => {
  try {
    const { filename } = req.query;
    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ message: "Invalid filename" });
    }
    // const filePath = path.join(process.cwd(), "uploads");
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    fs.unlinkSync(filePath);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err: any) {
    console.log(err);

    res.status(500).json({
      message: "Error deleting file",
      error: err.message,
    });
  }
};

export default deleteFile;
