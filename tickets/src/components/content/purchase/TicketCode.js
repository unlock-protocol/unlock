import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import QRCode from 'qrcode.react'

export const TicketCode = ({ signedAddress, publicKey }) => {
  if (!signedAddress || !publicKey) {
    return null // If we don't have a signed address or public key, we can't return a QR code
  } else {
    const validateUri =
      'https://tickets.unlock-protocol.com/checkin/' +
      signedAddress +
      '/' +
      publicKey
    return <StyledQRCode value={validateUri} size={350} renderAs="svg" />
  }
}

TicketCode.propTypes = {
  signedAddress: PropTypes.string,
  publicKey: PropTypes.string,
}

TicketCode.defaultProps = {
  signedAddress: null,
  publicKey: null,
}

export default TicketCode

const StyledQRCode = styled(QRCode)`
  width: 350px;
  height: 350px;
  max-width: 100%;
`
