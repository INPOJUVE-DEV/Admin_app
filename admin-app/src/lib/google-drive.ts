function isGoogleDriveHost(hostname: string) {
  return hostname === 'drive.google.com' || hostname === 'www.drive.google.com' || hostname === 'drive.usercontent.google.com'
}

export function extractGoogleDriveFileId(url: string) {
  try {
    const parsedUrl = new URL(url.trim())

    if (!isGoogleDriveHost(parsedUrl.hostname)) {
      return null
    }

    const fileIdFromQuery = parsedUrl.searchParams.get('id')

    if (fileIdFromQuery) {
      return fileIdFromQuery
    }

    const fileMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)

    if (fileMatch) {
      return fileMatch[1]
    }
  } catch {
    return null
  }

  return null
}

export function normalizeImageUrl(url: string) {
  const normalizedUrl = url.trim()

  if (!normalizedUrl) {
    return normalizedUrl
  }

  const googleDriveFileId = extractGoogleDriveFileId(normalizedUrl)

  if (googleDriveFileId) {
    return `https://drive.google.com/uc?export=view&id=${googleDriveFileId}`
  }

  return normalizedUrl
}
