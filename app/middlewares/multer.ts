import multer, { type FileFilterCallback } from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import config from '../shared/config.js'

const uploadDir = config.fileUploadPath

// ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueId = randomUUID()
    const ext = path.extname(file.originalname)
    cb(null, `vault-${uniqueId}${ext}`)
  }
})

// file filter (clean + extensible)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip']

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported.`))
  }
}

// multer instance (multi-file now)
const upload = multer({
  storage,
  // fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 100
  }
}).array('files', 50)

// 👇 clean middleware (your style)
export const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    console.log('in multer')

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File too large. Max limit is 50MB.'
        })
      }

      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too many files. Max 100 allowed.'
        })
      }

      return res.status(400).json({ error: err.message })
    }

    if (err) {
      return res.status(400).json({ error: err.message })
    }

    next()
  })
}
