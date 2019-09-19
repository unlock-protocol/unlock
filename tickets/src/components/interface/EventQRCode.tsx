import React from 'react'
import QRCode from 'qrcode.react'
import styled from 'styled-components'

interface Props {
  // For now we'll just JSON.Stringify arbitrary objects as the payload
  payload: { [key: string]: string }
}
export const EventQRCode = ({ payload }) => {
  return (
    <QR
      value={JSON.stringify(payload)}
      size={200}
      renderAs="canvas"
      includeMargin
    />
  )
}

export default EventQRCode

const QR = styled(QRCode)`
  width: 200px;
  height: 200px;
  border: 1px solid black;
`
