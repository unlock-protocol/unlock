import { Encoder, ErrorCorrectionLevel } from '@nuintun/qrcode'
import Dispatcher from '../fulfillment/dispatcher'
import config from '../config/config'

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
  const qrcode = new Encoder()
  qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.L)
  qrcode.write(url)
  qrcode.make()
  // this will return a base64 image
  return qrcode.toDataURL(5)
}
