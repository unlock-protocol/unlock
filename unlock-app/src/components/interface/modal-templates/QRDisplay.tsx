import React from 'react'
import { dismissQR } from '../../../actions/fullScreenModals'
import { MessageBox, Quit, QRCode } from './styles'
import { Dispatch } from '../../../unlockTypes' // eslint-disable-line

interface QRDisplayProps {
  dispatch: Dispatch
  data: string
}
const QRDisplay = ({ dispatch, data }: QRDisplayProps) => (
  <MessageBox>
    <Quit data-testid="qr-quit-button" onClick={() => dispatch(dismissQR())} />
    <QRCode value={data} renderAs="svg" size={256} />
  </MessageBox>
)

export default QRDisplay
