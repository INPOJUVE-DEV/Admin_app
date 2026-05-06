const coordinatePattern = '(-?\\d{1,3}(?:\\.\\d+)?)'

function toCoordinatePair(latitude: string, longitude: string) {
  const lat = Number(latitude)
  const lng = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return { lat, lng }
}

export function extractCoordinatesFromGoogleMapsUrl(url: string) {
  const normalizedUrl = url.trim()

  if (!normalizedUrl) {
    return null
  }

  const patterns = [
    new RegExp(`@${coordinatePattern},${coordinatePattern}`),
    new RegExp(`!3d${coordinatePattern}!4d${coordinatePattern}`),
    new RegExp(`[?&](?:q|query|ll)=${coordinatePattern},${coordinatePattern}`),
  ]

  for (const pattern of patterns) {
    const match = normalizedUrl.match(pattern)

    if (!match) {
      continue
    }

    const coordinates = toCoordinatePair(match[1], match[2])

    if (coordinates) {
      return coordinates
    }
  }

  return null
}

export function buildGoogleMapsUrl(lat?: number | null, lng?: number | null) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return undefined
  }

  return `https://www.google.com/maps?q=${lat},${lng}`
}
