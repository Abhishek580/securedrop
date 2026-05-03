import express from "express";
import addFiles from "./routes/files/uploadFiles.js";
import { multerUpload } from "./utils/multer.js";

const app = express();
const PORT = 5001;

app.use(express.json());

app.post("/api/files",multerUpload.any(), addFiles);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
