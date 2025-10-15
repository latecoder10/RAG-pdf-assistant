import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { ingest } from '../controllers/ingestController'
import { query } from '../controllers/queryController'
import { errorHandler } from '../middlewares/error'

// Ensure uploads folder always exists
const uploadPath = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath)
    },
    filename: (_req, file, cb) => {
      // prepend timestamp to avoid collisions
      cb(null, `${Date.now()}-${file.originalname}`)
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
})

export const router = Router()

// Routes
router.post('/ingest/pdf', upload.single('file'), ingest)
router.post('/query', query)

// Error handler (last)
router.use(errorHandler)
