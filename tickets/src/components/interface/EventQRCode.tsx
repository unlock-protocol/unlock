import React from 'react'
import QRCode from 'qrcode.react'
import styled from 'styled-components'

interface Props {
  // For now we'll just JSON.Stringify arbitrary objects as the payload
  payload: string
}
export const EventQRCode = ({ payload }: Props) => {
  return <QR value={payload} size={200} renderAs="canvas" />
}

export default EventQRCode

const QR = styled(QRCode)`
  width: 200px;
  height: 200px;
  border: 1px solid black;
`
