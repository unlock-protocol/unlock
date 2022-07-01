import { Encoder, ErrorCorrectionLevel } from '@nuintun/qrcode'
import Dispatcher from '../fulfillment/dispatcher'
import config from '../../config/config'

interface GenerateQrCodeProps {
  network: number
  lockAddress: string
  tokenId: string
}

const generateQrCodeUrl = (data: any, signature: any): string => {
  const url = new URL(`${config.unlockApp}/verification`)
  url.searchParams.append('data', data)
  url.searchParams.append('sig', signature)
  return url.toString()
}

export const generateQrCode = async ({
  network,
  lockAddress,
  tokenId,
}: GenerateQrCodeProps) => {
  const dispatcher = new Dispatcher()
  const [payload, signature] = await dispatcher.signToken(
    network,
    lockAddress,
    tokenId
  )
  const qrcode = new Encoder()
  qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.L)
  qrcode.write(generateQrCodeUrl(payload, signature))
  qrcode.make()
  // this will return a base64 image
  return qrcode.toDataURL(5)
}
