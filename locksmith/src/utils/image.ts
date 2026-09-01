import logger from '../logger'
import lockIcon from './lockIcon'
import { assertSafeCallbackUrl } from './safeCallbackUrl'

export const imageUrlToBase64 = async (url: string, lockAddress: string) => {
  // Fallback to the lock icon if the image is not available
  const icon = lockIcon.lockIcon(lockAddress)
  const dataURI = `data:image/svg+xml; charset=utf-8;base64,${Buffer.from(
    icon
  ).toString('base64')}`
  return imageURLToDataURI(url, dataURI)
}

export const imageURLToDataURI = async (url: string, fallbackURL?: string) => {
  try {
    // OG / certification paths fetch lock metadata.image (and event cover) on
    // unauthenticated routes. Fail closed on private/link-local targets.
    const safeUrl = await assertSafeCallbackUrl(url)
    const response = await fetch(safeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'image/png',
      },
      redirect: 'error',
    } as RequestInit)
    const contentType = response.headers.get('content-type')
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const imageURL = `data:${contentType};base64,${buffer.toString('base64')}`
    return imageURL
  } catch (err) {
    logger.error('Failed to retrieve image from url', { url, err })
    if (fallbackURL) {
      return fallbackURL
    } else {
      throw err
    }
  }
}
