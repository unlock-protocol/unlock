import React from 'react'
import { MessageBox, Dismiss } from './styles'

interface WalletCheckProps {
  onClose: () => void
}

const WalletCheck = ({ onClose }: WalletCheckProps) => (
  <MessageBox>
    <p>Please check your browser wallet.</p>
    <Dismiss onClick={() => onClose()}>Dismiss</Dismiss>
  </MessageBox>
)

export default WalletCheck
