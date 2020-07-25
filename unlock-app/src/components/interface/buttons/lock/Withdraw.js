import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Svg from '../../svg'
import Button from '../Button'
import DisabledButton from '../DisabledButton'
import UnlockPropTypes from '../../../../propTypes'
import { withdrawFromLock } from '../../../../actions/lock'

export const Withdraw = ({
  lock,
  withdrawalTransaction,
  withdraw,
  account,
  ...props
}) => {
  if (lock.balance > 0 && !withdrawalTransaction) {
    return (
      <Button
        label="Withdraw"
        action={() => {
          if (lock.balance > 0) {
            withdraw(lock)
          }
        }}
        {...props}
      >
        <Svg.Withdraw name="Withdraw" />
      </Button>
    )
  }
  return (
    <DisabledButton {...props}>
      <Svg.Withdraw name="Withdraw" />
    </DisabledButton>
  )
}

Withdraw.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  withdrawalTransaction: UnlockPropTypes.transaction,
  withdraw: PropTypes.func,
  account: UnlockPropTypes.account,
}

Withdraw.defaultProps = {
  withdrawalTransaction: null,
  account: null,
  withdraw: () => {},
}

const mapDispatchToProps = (dispatch) => ({
  withdraw: (lock) => dispatch(withdrawFromLock(lock)),
})

export default connect(null, mapDispatchToProps)(Withdraw)
