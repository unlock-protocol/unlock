import { Encoder, ErrorCorrectionLevel } from '@nuintun/qrcode'

export const generateQrCode = (content: string) => {
  const qrcode = new Encoder()
  qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.L)
  qrcode.write(content)
  qrcode.make()
  return qrcode.toDataURL(5)
}
