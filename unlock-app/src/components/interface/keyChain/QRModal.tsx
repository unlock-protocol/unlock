import React from 'react'
import QRCode from 'qrcode.react'
import InlineModal from '../InlineModal'

interface Props {
  active: boolean
  dismiss: () => void
  value: string
}

export const QRModal = ({ active, dismiss, value }: Props) => {
  return (
    <InlineModal active={active} dismiss={dismiss}>
      <QRCode value={value} size={256} includeMargin />
    </InlineModal>
  )
}

export default QRModal
