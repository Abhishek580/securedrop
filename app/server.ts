import express from 'express'
import { uploadFiles } from './routes/files/uploadFiles.js'
import getFiles from './routes/files/getFiles.js'
import { getAllBundles } from './routes/files/getAllBundles.js'
import { getBundle } from './routes/files/getBundle.js'
import deleteFiles from './routes/files/deleteFiles.js'
import { handleUpload } from './middlewares/multer.js'
import { startCleanupScheduler } from './scheduler/scheduler.js'

const app = express()
const PORT = 5001
// startCleanupScheduler()
app.use(express.json())

app.post('/api/files', handleUpload, uploadFiles)
app.get('/api/files/:bundleId', getBundle)
app.get('/api/allBundles', getAllBundles)
app.delete('/api/files', deleteFiles)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
