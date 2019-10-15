import React from 'react'
import QRCode from 'qrcode.react'
import { dismissQR } from '../../../actions/fullScreenModals'
import { MessageBox, Dismiss } from './styles'
import { Dispatch } from '../../../unlockTypes' // eslint-disable-line

interface QRDisplayProps {
  dispatch: Dispatch
  data: string
}
const QRDisplay = ({ dispatch, data }: QRDisplayProps) => (
  <MessageBox>
    <Dismiss onClick={() => dispatch(dismissQR())}>Dismiss</Dismiss>
    <QRCode value={data} renderAs="svg" includeMargin />
  </MessageBox>
)

export default QRDisplay
