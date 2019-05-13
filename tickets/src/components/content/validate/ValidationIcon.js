import React, { Fragment } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../../propTypes'
import { Title } from '../EventContent'
import SvgIconCheckmark from '../../interface/svg/IconCheckmark'
import SvgIconBg from '../../interface/svg/IconBg'
import { verifySignedAddress } from '../../../actions/ticket'

export const ValidationIcon = () => {
  const valid = false // remove this

  if (valid === true) {
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
}

ValidationIcon.defaultProps = {
  publicKey: null,
  eventAddress: null,
  signature: null,
}

const mapStateToProps = ({ keys, event }) => {

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
