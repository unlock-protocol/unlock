import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import QRCode from 'qrcode.react'
import withConfig from '../../../utils/withConfig'
import UnlockPropTypes from '../../../propTypes'

export const TicketCode = ({
  signedAddress,
  publicKey,
  lockAddress,
  config,
}) => {
  if (!lockAddress || !signedAddress || !publicKey) {
    return null
  }
  const validateUri =
    config.unlockTicketsUrl +
    '/checkin/' +
    lockAddress +
    '/' +
    publicKey +
    '/' +
    signedAddress
  return <StyledQRCode value={validateUri} size={200} renderAs="svg" />
}

TicketCode.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
  signedAddress: PropTypes.string,
  publicKey: PropTypes.string,
  lockAddress: PropTypes.string,
}

TicketCode.defaultProps = {
  signedAddress: null,
  publicKey: null,
  lockAddress: null,
}

export default withConfig(TicketCode)

const StyledQRCode = styled(QRCode)`
  width: 200px;
  height: 200px;
`
