const mappers: any = {};
import fs from "node:fs";
import path from "node:path";

mappers.mapFileDetails = function () {
  const UPLOAD_DIR = path.join(process.cwd(), "uploads");
  const files = fs.readdirSync(UPLOAD_DIR);
  if (!files?.length) return [];
  return files.map((file) => {
    const filePath = path.join(UPLOAD_DIR, file);
    const stats = fs.statSync(filePath);

    return {
      fileName: file,
      size: stats.size,
      createdAt: stats.birthtime,
      url: `/uploads/${file}`,
    };
  });
};

export default mappers;
