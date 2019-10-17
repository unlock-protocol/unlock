import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../../propTypes'
import { Title } from '../EventContent'
import SvgIconCheckmark from '../../interface/svg/IconCheckmark'
import SvgIconBg from '../../interface/svg/IconBg'
import { verifySignedAddress } from '../../../actions/ticket'

export const ValidationIcon = ({
  valid,
  publicKey,
  eventAddress,
  signature,
  verifySignedAddress,
}) => {
  if (valid === null) {
    verifySignedAddress(eventAddress, publicKey, signature)
  }

  if (valid) {
    return (
      <>
        <ValidTitle>Ticket Valid</ValidTitle>
        <IconHolder>
          <Checkmark />
        </IconHolder>
      </>
    )
  } else if (valid === false) {
    return (
      <>
        <Title>Ticket Not Valid</Title>
        <IconHolder>
          <NoCheckmark />
        </IconHolder>
      </>
    )
  } else {
    return (
      <>
        <Title>Ticket Validating</Title>
        <IconHolder>
          <NoCheckmark />
        </IconHolder>
      </>
    )
  }
}

ValidationIcon.propTypes = {
  publicKey: UnlockPropTypes.address,
  eventAddress: UnlockPropTypes.address,
  signature: PropTypes.string,
  valid: PropTypes.bool,
  verifySignedAddress: PropTypes.func.isRequired,
}

ValidationIcon.defaultProps = {
  publicKey: null,
  eventAddress: null,
  signature: null,
  valid: null,
}

export const mapStateToProps = (
  { tickets, keys },
  { signature, publicKey, eventAddress }
) => {
  let valid = null
  let normalizedPublicKey
  let potentialKeys = false

  if (publicKey) {
    normalizedPublicKey = publicKey.toString().toLowerCase()

    const now = new Date().getTime() / 1000

    const keysForEvent = Object.values(keys).filter(key => {
      // We need to remember if there were some suitable keys so we know whether or not to return invalid
      // or if we're in a state where the keys could potentially still be loading
      if (
        key.lock === eventAddress &&
        key.owner.toString().toLowerCase() === normalizedPublicKey
      )
        potentialKeys = true

      return (
        key.lock === eventAddress &&
        key.owner.toString().toLowerCase() === normalizedPublicKey &&
        key.expiration > now
      )
    })

    if (
      tickets.valid &&
      tickets.valid[signature].toString().toLowerCase() ===
        normalizedPublicKey &&
      keysForEvent.length
    ) {
      valid = true
    } else if (
      (tickets.invalid && tickets.invalid[signature]) ||
      potentialKeys
    ) {
      valid = false
    }
  }

  return {
    valid,
  }
}

const mapDispatchToProps = dispatch => ({
  verifySignedAddress: (eventAddress, publicKey, signature) =>
    dispatch(verifySignedAddress(eventAddress, publicKey, signature)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ValidationIcon)

const IconHolder = styled.div`
  max-width: 200px;
  margin: auto;
`

const ValidTitle = styled(Title)`
  color: var(--link);
`

const Checkmark = styled(SvgIconCheckmark)`
  width: 450px;
  max-width: 100%;
`

const NoCheckmark = styled(SvgIconBg)`
  width: 450px;
  max-width: 100%;
`
