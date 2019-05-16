import React, { Fragment } from 'react'
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
      <Fragment>
        <ValidTitle>Ticket Valid</ValidTitle>
        <IconHolder>
          <SvgIconCheckmark />
        </IconHolder>
      </Fragment>
    )
  } else if (valid === false) {
    return (
      <Fragment>
        <Title>Ticket Not Valid</Title>
        <IconHolder>
          <SvgIconBg />
        </IconHolder>
      </Fragment>
    )
  } else {
    return (
      <Fragment>
        <Title>Ticket Validating</Title>
        <IconHolder>
          <SvgIconBg />
        </IconHolder>
      </Fragment>
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

const mapStateToProps = ({ tickets }, { signature, publicKey }) => {
  let valid
  if (
    tickets.valid &&
    tickets.valid[signature].toString().toLowerCase() ===
      publicKey.toString().toLowerCase()
  ) {
    valid = true
  } else if (tickets.invalid && tickets.invalid[signature]) {
    valid = false
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
