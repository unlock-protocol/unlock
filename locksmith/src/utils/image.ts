import logger from '../logger'
import lockIcon from './lockIcon'
import resvg from '@resvg/resvg-js'
import SVGtoPDF from 'svg-to-pdfkit'
import PDFDocument from 'pdfkit'
import blobStream from 'blob-stream'

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
    logger.error('Failed to retrieve image from url', { url, err })
    if (fallbackURL) {
      return fallbackURL
    } else {
      throw err
    }
  }
}

export const svgStringToDataURI = (svgString: string) => {
  const svg = new resvg.Resvg(svgString)
  const pngData = svg.render()
  const pngBuffer = pngData.asPng()
  const dataURI = `data:image/png;base64,${pngBuffer.toString('base64')}`
  return dataURI
}

export const svgStringToPdfDataURI = (svgString: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      compress: false,
      size: [1000, 1000],
    })

    const stream = doc.pipe(blobStream())

    SVGtoPDF(doc, svgString, 0, 0, {
      preserveAspectRatio: 'xMidYMid meet',
      width: 1000,
      height: 1000,
    })

    doc.end()

    stream.on('finish', () => {
      const dataURI = stream.toBlobURL('application/pdf')
      resolve(dataURI)
    })

    stream.on('error', (err: Error) => {
      reject(err)
    })
  })
}
