import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import withConfig from '../../../utils/withConfig'
import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import { withdrawFromLock } from '../../../actions/lock'

export class LockIconBar extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.startWithdrawal = this.startWithdrawal.bind(this)
  }

  startWithdrawal() {
    const { lock, account, withdraw } = this.props
    if (lock.balance > 0) {
      withdraw(lock, account)
    }
  }

  render() {
    const { lock, transaction, withdraw, toggleCode, withdrawalTransaction, config } = this.props

    if (!transaction) {
      // We assume that the lock has been successfuly deployed?
      // TODO if the transaction is missing we should try to look it up from the lock address
    } else if (transaction.status === 'submitted') {
      return(
        <CreatorLockStatus lock={lock} status="Submitted" />
      )
    } else if (transaction.status === 'mined' && transaction.confirmations < config.requiredConfirmations) {
      return (
        <CreatorLockStatus
          lock={lock}
          status="Confirming"
          confirmations={transaction.confirmations}
        />
      )
    } else {
      return (
        <StatusBlock>
          <IconBarContainer>
            <IconBar>
              {!withdraw &&
                <Buttons.Withdraw action={this.startWithdrawal} backgroundColor='var(--green)' fillColor='white' as="button" />
              }
              {withdraw &&
                <Buttons.Withdraw action={this.startWithdrawal} as="button" />
              }
              <Buttons.Edit as="button" />
              {/* Reinstate when we're ready <Buttons.ExportLock /> */}
              <Buttons.Code action={toggleCode} as="button" />
            </IconBar>
          </IconBarContainer>
          <SubStatus>
            {withdrawalTransaction && withdrawalTransaction.status === 'submitted' &&
            <>
              Submitted to Network...
            </>
            }
            {withdrawalTransaction && withdrawalTransaction.status === 'mined' && withdrawalTransaction.confirmations < config.requiredConfirmations &&
            <>
              Confirming Withdrawal
              <WithdrawalConfirmations>
                {withdrawalTransaction.confirmations}
                /
                {config.requiredConfirmations}
              </WithdrawalConfirmations>
            </>
            }
          </SubStatus>
        </StatusBlock>
      )
    }
  }
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction,
  toggleCode: PropTypes.func.isRequired,
  withdraw: PropTypes.func.isRequired,
  withdrawalTransaction: UnlockPropTypes.transaction,
  config: UnlockPropTypes.configuration.isRequired,
  account: UnlockPropTypes.account,
}

LockIconBar.defaultProps = {
  transaction: null,
  withdrawalTransaction: null,
  account: null,
}

const mapStateToProps = (state, { lock }) => {
  const transaction = state.transactions[lock.transaction]
  let withdrawalTransaction = null
  Object.keys(state.transactions).forEach((el) => {
    if (state.transactions[el].withdrawal === lock.id) withdrawalTransaction = state.transactions[el]
  })
  return {
    transaction,
    withdrawalTransaction,
    lock,
  }
}

const mapDispatchToProps = dispatch => ({
  withdraw: (lock, account) => dispatch(withdrawFromLock(lock, account)),
})

export default withConfig(connect(mapStateToProps, mapDispatchToProps)(LockIconBar))

const StatusBlock = styled.div`
`

const IconBarContainer = styled.div`
  display: grid;
  justify-items: end;
  padding-right: 24px;
`

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(3, 24px);
`

const SubStatus = styled.div`
  margin-top: 13px;
  font-size: 10px;
  font-family: 'IBM Plex Sans';
  font-weight: normal;
  color: var(--green);
  text-align: right;
  padding-right: 24px;
`

const WithdrawalConfirmations = styled.span`
  margin-left: 15px;
`
