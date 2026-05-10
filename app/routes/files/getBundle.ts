import type { Request, Response } from 'express'
import { getBundleData, generateSignedUrl } from '../../core/files.js'
import { formatFileResponse } from '../../mappers/files/mappers.getBundles.js'

export const getBundle = async (req: Request<{ bundleId: string }>, res: Response) => {
  try {
    const { bundleId } = req.params

    if (!bundleId) {
      return res.status(400).json({ message: 'bundleId is required' })
    }

    const bundle = await getBundleData(bundleId)

    if (!bundle) {
      return res.status(404).json({ message: 'Bundle not found' })
    }

    const files = bundle.files

    // 1. Run the Mapper (Counter logic & Storage Key extraction)
    const fileResponses = await formatFileResponse(files)

    // 2. Generate URLs and Merge in one step
    const finalFileData = await Promise.all(
      fileResponses.fileData.map(async (file) => {
        // Look for a storage key matching this fileId
        const storageItem = fileResponses.storageKeys.find((s) => s.fileId === file.fileId)

        let url = null
        if (storageItem) {
          const result = await generateSignedUrl(storageItem.key)
          url = result.url
        }

        return { ...file, url }
      })
    )
    // 4. Response
    return res.json({
      bundleId: bundle.id,
      totalFiles: files.length,
      completedFiles: fileResponses.aggregations.completedFiles,
      failedFiles: fileResponses.aggregations.failedFiles,
      pendingFiles: fileResponses.aggregations.pendingFiles,
      files: finalFileData
    })
  } catch (err) {
    console.error('Get Bundle Error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
