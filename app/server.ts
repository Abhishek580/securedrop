import express, { type Request, type Response } from "express";
import addFiles from "./routes/files/addFiles.js";

const app = express();
const PORT = 5001;

app.use(express.json());

app.get("/api/files", addFiles);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); 
});