import logger from '../logger'
import resvg from '@resvg/resvg-js'
import { PDFDocument } from 'pdf-lib'

export const svgStringToPdfURI = async (svgString: string): Promise<string> => {
  try {
    const svg = new resvg.Resvg(svgString, {
      dpi: 200,
      fitTo: {
        mode: 'original',
      },
    })
    const pngData = svg.render()
    const pngBuffer = pngData.asPng()

    // Get dimensions
    const width = pngData.width
    const height = pngData.height

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a page with the same dimensions as the PNG
    const page = pdfDoc.addPage([width, height])

    // Embed the PNG image
    const pngImage = await pdfDoc.embedPng(pngBuffer)

    // Draw the image on the page
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
    })

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    })

    // Convert to data URI
    const dataURI = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`
    return dataURI
  } catch (err) {
    logger.error('Failed to convert SVG to PDF', { err })
    throw err
  }
}
