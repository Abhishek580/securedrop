import type { Request, Response } from 'express'
import { prismaClient } from '../../core/adapters/prismaClient.js'
import { cleanupQueue } from '../../core/infra/queue/queue.js'

export const deleteFile = async (req: Request<{ fileId: string }>, res: Response) => {
  try {
    const { fileId } = req.params

    const file = await prismaClient.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    if (file.status === 'DELETED') {
      return res.json({ message: 'File already deleted' })
    }

    await cleanupQueue.add('delete-file', { fileId })

    return res.json({ message: 'Delete scheduled' })
  } catch (err) {
    console.error('Delete File Error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
