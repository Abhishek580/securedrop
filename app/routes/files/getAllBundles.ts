import type { Request, Response } from 'express'
import { getDeletedBundlesFromDb } from '../../core/files.js'

import { formatBundleResponse } from '../../mappers/files/mappers.getAllBundles.js'

export const getAllBundles = async (_req: Request, res: Response) => {
  try {
    const bundles = await getDeletedBundlesFromDb()
    const response = formatBundleResponse(bundles)

    return res.json({ bundles: response })
  } catch (err) {
    console.error('Get All Bundles Error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
