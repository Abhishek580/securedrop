import type { Request, Response } from "express";
import mappers from "../../mappers/files/getFiles.js";
// import { testUpload } from "../../core/adapters/test.js";

const getFiles = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const fileDetails = mappers.mapFileDetails();

    if (!fileDetails?.length) {
      return res.status(400).json({
        message: "No files available",
      });
    }

    // testUpload();
    res.status(200).json({
      message: "Files fetched successfully",
      count: fileDetails.length,
      files: fileDetails,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error fetching files",
      error: err.message,
    });
  }
};

export default getFiles;
