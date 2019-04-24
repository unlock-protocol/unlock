import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import QRCode from 'qrcode.react'
import withConfig from '../../../utils/withConfig'
import UnlockPropTypes from '../../../propTypes'

export const TicketCode = ({
  signedAddress,
  publicKey,
  eventAddress,
  config,
}) => {
  if (!signedAddress || !publicKey) {
    return null // If we don't have a signed address or public key, we can't return a QR code
  } else {
    const validateUri =
      config.unlockTicketsUrl +
      '/checkin/' +
      eventAddress +
      '/' +
      publicKey +
      '/' +
      signedAddress
    return <StyledQRCode value={validateUri} size={350} renderAs="svg" />
  }
}

TicketCode.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
  signedAddress: PropTypes.string,
  publicKey: PropTypes.string,
  eventAddress: PropTypes.string,
}

TicketCode.defaultProps = {
  signedAddress: null,
  publicKey: null,
  eventAddress: null,
}

export default withConfig(TicketCode)

const StyledQRCode = styled(QRCode)`
  width: 200px;
  height: 200px;
  max-width: 100%;
  margin: auto;
  margin-bottom: 25px;
  margin-top: 25px;
`
