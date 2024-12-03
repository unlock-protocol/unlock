import { SubgraphService } from '@unlock-protocol/unlock-js'
import archiver from 'archiver'
import { uploadZipToS3 } from './s3'
import config from '../config/config'
import pdfmake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { Receipt, ReceiptBase } from '../models'
import { getWeb3Service } from '../initializers'

// @ts-ignore
pdfmake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

export const getAllReceipts = async ({
  network,
  lockAddress,
}: {
  network: number
  lockAddress: string
}) => {
  const subgraph = new SubgraphService()
  const receipts: any[] = []
  const limit = 1000
  let skip = 0
  let more = true
  while (more) {
    const results = await subgraph.receipts(
      {
        where: {
          lockAddress: lockAddress.toLowerCase(),
        },
      },
      {
        networks: [network],
      }
    )
    if (results.length < limit) {
      more = false
    } else {
      skip += limit
    }
    receipts.push(...results)
  }
  return receipts
}

export const getAllReceiptsWithSupplierData = async (
  network: number,
  lockAddress: string
) => {
  const [receipts, receiptsData, receiptBaseData] = await Promise.all([
    getAllReceipts({
      network,
      lockAddress,
    }),
    Receipt.findAll({
      where: {
        lockAddress,
        network,
      },
    }),
    ReceiptBase.findOne({
      where: {
        lockAddress,
        network,
      },
    }),
  ])

  const receiptsDataMap = receiptsData.reduce<Record<string, Receipt>>(
    (map, receiptData) => {
      map[receiptData.id] = receiptData
      return map
    },
    {}
  )

  const items = receipts
    .map((item) => {
      const receiptData = receiptsDataMap[item.id]
      return {
        ...item,
        fullName: receiptData?.fullname,
        vat: receiptBaseData?.vat,
        service: receiptBaseData?.servicePerformed,
        supplierName: receiptBaseData?.supplierName,
        supplierAddress:
          receiptBaseData?.addressLine1 && receiptBaseData?.addressLine2
            ? `${receiptBaseData?.addressLine1}\n${receiptBaseData.addressLine2}`
            : receiptBaseData?.addressLine1 ||
              receiptBaseData?.addressLine2 ||
              '',
        city: receiptBaseData?.city,
        state: receiptBaseData?.state,
        zip: receiptBaseData?.zip,
        country: receiptBaseData?.country,
      }
    })
    .sort((a, b) => {
      return Number(a.timestamp) - Number(b.timestamp)
    })

  return items
}

export const getReceiptsZipName = (lockAddress: string, network: number) => {
  return `receipts-${network}-${lockAddress}.zip`
}

export const zipReceiptsAndSendtos3 = async (
  lockAddress: string,
  network: number
): Promise<boolean> => {
  const receipts = await getAllReceiptsWithSupplierData(network, lockAddress)

  if (!receipts.length) {
    return false
  }

  const web3Service = getWeb3Service()
  const lock = await web3Service.getLock(lockAddress, network)

  const createPDFBuffer = async (data: any) => {
    const amount = `${Number(data.amountTransferred) / Math.pow(10, lock.currencyDecimals)} ${lock.currencySymbol}`
    const dynamicFields = [
      'supplierName',
      'supplierAddress',
      'city',
      'state',
      'zip',
      'country',
    ]
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 256">
      <path d="M449.93988,230.05371h53.04V0h-53.04ZM215.102,15.97607H159.5058V71.58386H70.67963V15.97607H15.083V71.58386H0V98.00415H15.083v41.62573c0,52.08155,45.05224,94.57764,100.3291,94.57764,54.957,0,99.68994-42.49609,99.68994-94.57764V98.00415h14.964V71.58386H215.102ZM159.5058,139.62988c0,24.603-19.49072,44.73242-44.09375,44.73242a44.86367,44.86367,0,0,1-44.73242-44.73242V98.00415H159.5058ZM348.65668,67.09912c-19.17139,0-37.70362,8.627-48.24756,24.2832H299.77l-3.19483-19.81005h-46.6499V230.05371h53.04v-82.436c0-18.21241,14.05908-32.91016,30.99365-32.91016,17.57325,0,31.3125,14.69775,31.3125,32.27148v83.07471h53.04v-88.187C418.31146,99.68994,391.47211,67.09912,348.65668,67.09912Zm680.87695,77.32324,65.18164-72.85009h-65.501l-51.123,59.43066h-.959V0h-53.04V230.05371h53.04V157.84229h.959l52.7207,72.21142h66.7793ZM613.20844,67.09912c-49.5254,0-90.42383,37.70313-90.42383,83.71387s40.89843,83.39453,90.42383,83.39453,90.42382-37.38379,90.42382-83.39453S662.73383,67.09912,613.20844,67.09912Zm0,120.77832c-20.12989,0-37.06446-16.93457-37.06446-37.06445s16.93457-37.06445,37.06446-37.06445,37.38378,16.93457,37.38378,37.06445S633.33832,187.87744,613.20844,187.87744ZM814.81879,113.4292c15.65625,0,28.4375,8.94678,33.23047,21.40771h53.998c-5.43164-37.064-41.53711-67.73779-86.26953-67.73779-49.8457,0-91.0635,37.70313-91.0635,83.71387s41.2178,83.39453,91.0635,83.39453c43.77344,0,81.15723-29.396,86.26953-68.05762h-53.998c-5.752,13.1001-17.57422,21.40772-33.23047,21.40772A36.9551,36.9551,0,0,1,778.07465,150.813C778.07465,130.68311,794.36957,113.4292,814.81879,113.4292Z" />
    </svg>`

    const dynamicContent = dynamicFields.reduce((acc: any[], key: string) => {
      const value = data[key]
      if (value) {
        acc.push({
          text: value,
          bold: key === 'supplierName',
          margin: [0, 0, 0, 8],
        })
      }
      return acc
    }, [])

    const docDefinition = {
      content: [
        { text: 'Receipt Number:', color: 'black', margin: [0, 0, 0, 8] },
        { text: `#${data.receiptNumber}`, bold: true, margin: [0, 0, 0, 16] },
        { text: 'Transaction Date:', margin: [0, 0, 0, 8] },
        {
          text: new Date(data.timestamp * 1000).toDateString(),
          bold: true,
          margin: [0, 0, 0, 16],
        },
        { text: 'Transaction Hash:', margin: [0, 0, 0, 8] },
        { text: data.id, bold: true, margin: [0, 0, 0, 16] },
        ...dynamicContent,
        {
          text: 'Service Performed:',
          color: '#603DEB',
          bold: true,
          margin: [0, 0, 0, 8],
        },
        { text: data.service || 'NFT membership', margin: [0, 0, 0, 16] },
        { text: 'Amount:', color: '#603DEB', bold: true, margin: [0, 0, 0, 8] },
        {
          columns: [
            { text: 'TOTAL', margin: [0, 0, 0, 16] },
            {
              text: amount,
              bold: true,
              margin: [0, 0, 0, 16],
              alignment: 'right',
            },
          ],
        },
        {
          columns: [
            {
              text: 'Powered by ',
              fontSize: 10,
              width: 'auto',
              margin: [220, 0, 0, 0],
            },
            { svg: svgContent, width: 50, height: 12, margin: [5, 0, 0, 0] },
          ],
        },
      ],
    }

    return new Promise((resolve, reject) => {
      const pdfDoc = pdfmake.createPdf(docDefinition as TDocumentDefinitions)
      pdfDoc.getBuffer((buffer) => {
        if (buffer) resolve(Buffer.from(buffer))
        else reject(new Error('Failed to create PDF buffer'))
      })
    })
  }

  const createZipBuffer = async (receiptsToZip: any) => {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } })
      const chunks: Buffer[] = []

      archive.on('data', (chunk) => {
        chunks.push(chunk)
      })

      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks)
        resolve(zipBuffer)
      })

      archive.on('error', (err) => {
        reject(err)
      })
      ;(async () => {
        for (const receipt of receiptsToZip) {
          const pdfBuffer = await createPDFBuffer(receipt)
          archive.append(pdfBuffer as Buffer, {
            name: `receipt_${receipt.receiptNumber}.pdf`,
          })
        }
        await archive.finalize()
      })()
    })
  }

  const zipBuffer = await createZipBuffer(receipts)
  const key = `receipts-${network}-${lockAddress}.zip`
  let isUploaded = false
  await uploadZipToS3(config.storage.bucket, key, zipBuffer as Buffer)
    .then(() => (isUploaded = true))
    .catch(() => (isUploaded = false))

  return isUploaded
}
