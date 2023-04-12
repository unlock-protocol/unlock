import logger from '../logger'
import lockIcon from './lockIcon'

export const imageUrlToBase64 = async (url: string, lockAddress: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'image/png',
      },
    })

    const contentType = response.headers.get('content-type')
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const imageURL = `data:${contentType};base64,${buffer.toString('base64')}`
    return imageURL
  } catch (err) {
    logger.info(err)
    // Fallback to the lock icon if the image is not available
    const icon = lockIcon.lockIcon(lockAddress)
    const dataURI = `data:image/svg+xml; charset=utf-8;base64,${Buffer.from(
      icon
    ).toString('base64')}`
    return dataURI
  }
}
