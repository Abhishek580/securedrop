const mappers: any = {}

mappers.cleanOutput = function (files: Array<any>) {
  const uploadedFiles = files.map((file) => ({
    fieldName: file.fieldname,
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path
  }))

  return uploadedFiles
}

export default mappers
