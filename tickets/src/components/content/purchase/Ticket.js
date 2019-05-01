import styled from 'styled-components'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../../propTypes'
import { signAddress } from '../../../actions/ticket'
import Media from '../../../theme/media'

import { KeyStatus } from '../../../selectors/keys'
import TicketCode from './TicketCode'
import withConfig from '../../../utils/withConfig'

export class Ticket extends Component {
  constructor(props) {
    super(props)

    this.state = {
      signed: false,
    }

    this.setAsSigned.bind(this)
  }

  componentDidUpdate() {
    const { lock, signAddress, signedLockAddress, keyStatus } = this.props
    if (keyStatus === KeyStatus.VALID) {
      const { signed } = this.state
      if (signedLockAddress && !signed) {
        this.setAsSigned()
      } else if (!signed && !signedLockAddress) {
        signAddress(lock.address)
        this.setAsSigned()
      }
    }
  }

  setAsSigned() {
    this.setState({ signed: true })
  }

  render() {
    const { account, lock, signedLockAddress, keyStatus } = this.props
    if (keyStatus !== KeyStatus.VALID) {
      return null
    }
    return (
      <TicketInfo>
        <TicketCode
          publicKey={account.address}
          signedAddress={signedLockAddress}
          lockAddress={lock.address}
        />
      </TicketInfo>
    )
  }
}

export const mapDispatchToProps = dispatch => ({
  signAddress: address => {
    dispatch(signAddress(address))
  },
})

export const mapStateToProps = ({ tickets }, props) => {
  const { lock, account } = props
  let signedLockAddress
  if (tickets[lock.address]) {
    signedLockAddress = tickets[lock.address]
  }

  return {
    signedLockAddress,
    account,
    lock,
  }
}

Ticket.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
  signAddress: PropTypes.func.isRequired,
  signedLockAddress: PropTypes.string,
  keyStatus: PropTypes.string,
}

Ticket.defaultProps = {
  signedLockAddress: null,
  keyStatus: null,
}

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Ticket)
)

const TicketInfo = styled.div`
  display: grid;
  ${Media.phone`
    justify-content: center;
  `}
`
