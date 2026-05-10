export interface BundleInput {
  id: string;
  createdAt: Date;
  _count: {
    files: number;
  };
  files: {
    status: string;
  }[];
}

export const formatBundleResponse = (bundles: BundleInput[]) => {
  return bundles.map((bundle) => {
    let completedFiles = 0
    let failedFiles = 0
    let pendingFiles = 0

    for (const file of bundle.files) {
      if (file.status === 'COMPLETED') completedFiles++
      else if (file.status === 'FAILED') failedFiles++
      else pendingFiles++
    }

    return {
      bundleId: bundle.id,
      totalFiles: bundle._count.files,
      completedFiles,
      failedFiles,
      pendingFiles,
      createdAt: bundle.createdAt
    }
  })
}