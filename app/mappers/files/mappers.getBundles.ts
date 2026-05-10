import type { getBundleData } from '../../core/files.js'
// import { r2Client } from '../../core/infra/storage/r2Client.js'
// import { GetObjectCommand } from '@aws-sdk/client-s3'
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// // Define the shape of the aggregations
export interface FormattedFile {
  fileId: string
  name: string | null
  mimeType: string | null
  size: number
  status: string // or your FileStatus enum
  createdAt: Date
}

export interface FileAggregations {
  completedFiles: number
  failedFiles: number
  pendingFiles: number
}
export interface StorageKey {
  key: string
  fileId: string
}
// Combine them for the final return type
export interface MapFileResponse {
  fileData: FormattedFile[] // Use [] because you likely have multiple files
  aggregations: FileAggregations
  storageKeys: StorageKey[] // An array of objects like [{key: "abc"}, {key: "xyz"}]
}
// type BundleData = NonNullable<Awaited<ReturnType<typeof getBundleData>>>
// // Get the specific type of the files array INSIDE that bundle
// type FileDataArray = BundleData['files']

// export const formatFileResponse = async (files: FileDataArray): Promise<MapFileResponse> => {
//   // 1. Initialize everything
//   let completedFiles = 0
//   let failedFiles = 0
//   let pendingFiles = 0
//   const storageKeys: StorageKey[] = [] // Push objects directly here
//   //   // 2. Use .map() to return the promises, but update counters inside
//   const fileData = await Promise.all(
//     files.map(async (file) => {
//       // Logic & Counter updates in one pass
//       if (file.status === 'DELETED') {
//         completedFiles++
//         const fileId = file.id
//         if (file.storageKey) storageKeys.push({ key: file.storageKey, fileId: fileId })
//       } else if (file.status === 'FAILED') {
//         failedFiles++
//       } else {
//         pendingFiles++
//       }

//       // Return the object for the fileData array
//       return {
//         fileId: file.id,
//         name: file.originalName,
//         mimeType: file.mimeType,
//         size: file.size,
//         status: file.status,
//         createdAt: file.createdAt
//       }
//     })
//   )

//   // 3. Return everything exactly as your interface expects
//   return {
//     fileData, // This is now an array of all the objects returned above
//     aggregations: { completedFiles, failedFiles, pendingFiles },
//     // Convert string[] to StorageKey[] to match  interface
//     storageKeys: storageKeys
//   }
// }

// Define a simple interface for what a "File" looks like to this mapper
export interface InputFile {
  id: string
  status: string
  storageKey?: string | null
  originalName: string | null
  mimeType: string | null
  size: number
  createdAt: Date
}

// Your mapper is now "Pure" - no imports from core!
export const formatFileResponse = async (files: InputFile[]): Promise<MapFileResponse> => {
  let completedFiles = 0
  let failedFiles = 0
  let pendingFiles = 0
  const storageKeys: StorageKey[] = []

  const fileData = files.map((file) => {
    // Logic & Counter updates
    if (file.status === 'DELETED') {
      // Adjust to 'COMPLETED' if needed
      completedFiles++
      if (file.storageKey) storageKeys.push({ key: file.storageKey, fileId: file.id })
    } else if (file.status === 'FAILED') {
      failedFiles++
    } else {
      pendingFiles++
    }

    return {
      fileId: file.id,
      name: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      status: file.status,
      createdAt: file.createdAt
    }
  })

  return {
    fileData,
    aggregations: { completedFiles, failedFiles, pendingFiles },
    storageKeys
  }
}
