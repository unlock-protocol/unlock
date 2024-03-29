import Dispatcher from '../fulfillment/dispatcher'
import config from '../config/config'
import { Encoder, Byte } from '@nuintun/qrcode'

interface GenerateQrCodeProps {
  network: number
  lockAddress: string
  tokenId: string
  account?: string
}

const generateQrCodeUrlFromSignedData = (data: any, signature: any): string => {
  const url = new URL(`${config.unlockApp}/verification`)
  url.searchParams.append('data', data)
  url.searchParams.append('sig', signature)
  return url.toString()
}

export const generateQrCodeUrl = async ({
  network,
  lockAddress,
  tokenId,
  account,
}: GenerateQrCodeProps) => {
  const dispatcher = new Dispatcher()
  const [payload, signature] = await dispatcher.signToken(
    network,
    lockAddress,
    tokenId,
    account
  )
  return generateQrCodeUrlFromSignedData(payload, signature)
}

export const generateQrCode = async ({
  network,
  lockAddress,
  tokenId,
  account,
}: GenerateQrCodeProps) => {
  const url = await generateQrCodeUrl({
    network,
    lockAddress,
    tokenId,
    account,
  })
  const encoder = new Encoder({
    level: 'L',
  })
  const qrcode = encoder.encode(new Byte(url))

  // this will return a base64 image
  return qrcode.toDataURL(5)
}
