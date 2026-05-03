import express from "express";
import uploadFiles from "./routes/files/uploadFiles.js";
import getFiles from "./routes/files/getFiles.js";
import deleteFiles from "./routes/files/deleteFiles.js";
import { multerUpload } from "./utils/multer.js";

const app = express();
const PORT = 5001;

app.use(express.json());

app.post("/api/files",multerUpload.any(), uploadFiles);
app.get("/api/files", getFiles);
app.delete("/api/files", deleteFiles);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
