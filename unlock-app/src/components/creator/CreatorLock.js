import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import CreatorLockStatus from './lock/CreatorLockStatus'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import withConfig from '../../utils/withConfig'
import { withdrawFromLock } from '../../actions/lock'

export class CreatorLock extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      showEmbedCode: false,
      showKeys: false,
    }
    this.startWithdrawal = this.startWithdrawal.bind(this)
    this.toggleEmbedCode = this.toggleEmbedCode.bind(this)
    this.toggleKeys = this.toggleKeys.bind(this)
  }

  startWithdrawal() {
    const { lock, account, withdraw } = this.props
    if (lock.balance > 0) {
      withdraw(lock, account)
    }
  }

  toggleEmbedCode() {
    this.setState((previousState) => ({
      showEmbedCode: !previousState.showEmbedCode,
    }))
  }

  toggleKeys() {
    this.setState((previousState) => ({
      showKeys: !previousState.showKeys,
    }))
  }

  render() {
    // TODO add all-time balance to lock

    const { lock, transaction, withdrawalTransaction, config } = this.props
    const { showEmbedCode, showKeys } = this.state

    let startWithdrawal
    if (withdrawalTransaction && ((withdrawalTransaction.status === 'submitted' ||
      (withdrawalTransaction.status === 'mined' && withdrawalTransaction.confirmations < config.requiredConfirmations)))) {
      startWithdrawal = false
    } else {
      startWithdrawal = this.startWithdrawal
    }

    // Some sanitization of strings to display
    let name = lock.name || 'New Lock'
    let outstandingKeys = lock.outstandingKeys || 0
    let lockComponentStatusBlock = (
      <StatusBlock>
        <LockIconBarContainer>
          <LockIconBar withdraw={startWithdrawal} toggleCode={this.toggleEmbedCode} />
        </LockIconBarContainer>
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
      </StatusBlock>)

    if (!transaction) {
      // We assume that the lock has been succeesfuly deployed?
      // TODO if the transaction is missing we should try to look it up from the lock address
    } else if (transaction.status === 'submitted') {
      lockComponentStatusBlock = <CreatorLockStatus lock={lock} status="Submitted" />
    } else if (transaction.status === 'mined' &&
        transaction.confirmations < config.requiredConfirmations) {
      lockComponentStatusBlock = <CreatorLockStatus
        lock={lock}
        status="Confirming"
        confirmations={transaction.confirmations}
      />
    }

    return (
      <LockRow onClick={this.toggleKeys}>
        <Icon lock={lock} address={lock.address} />
        <LockName>
          {name}
          <LockAddress>{lock.address}</LockAddress>
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
        </LockDuration>
        <LockKeys>
          {outstandingKeys}
/
          {lock.maxNumberOfKeys}
        </LockKeys>
        <Balance amount={lock.keyPrice} />
        <Balance amount={lock.balance} />
        {lockComponentStatusBlock}
        {showEmbedCode &&
          <LockPanel>
            <LockDivider />
            <EmbedCodeSnippet lock={lock} />
          </LockPanel>
        }
        {!showEmbedCode && showKeys &&
          <LockPanel>
            <LockDivider />
            <KeyList lock={lock} />
          </LockPanel>
        }
      </LockRow>
    )
  }
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction,
  withdrawalTransaction: UnlockPropTypes.transaction,
  account: UnlockPropTypes.account,
  withdraw: PropTypes.func.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

CreatorLock.defaultProps = {
  transaction: null,
  withdrawalTransaction: null,
  account: null,
}

const mapStateToProps = (state, { lock }) => {
  const transaction = state.transactions[lock.transaction]
  let withdrawalTransaction
  Object.keys(state.transactions).forEach((el) => {
    if (state.transactions[el].withdrawal === lock.id) withdrawalTransaction = state.transactions[el]
  })
  const account = state.account
  return {
    transaction,
    withdrawalTransaction,
    account,
    lock,
  }
}

const mapDispatchToProps = dispatch => ({
  withdraw: (lock, account) => dispatch(withdrawFromLock(lock, account)),
})

export default withConfig(connect(mapStateToProps, mapDispatchToProps)(CreatorLock))

export const LockRowGrid = 'grid-template-columns: 32px minmax(100px, 3fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);'

const StatusBlock = styled.div`
`

const LockIconBarContainer = styled.div`
  display: grid;
  justify-items: end;
  padding-right: 24px;
  visibility: hidden;
`

export const LockRow = styled.div`
  &:hover {
    ${LockIconBarContainer} {
      visibility: visible;
    }
  }
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  min-height: 60px;
  padding-left: 8px;
  color: var(--slate);
  font-size: 14px;
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-gap: 16px;
  ${LockRowGrid}
  grid-template-rows: 60px;
  grid-column-gap: 16px;
  grid-row-gap: 0;
  align-items: center;
  cursor: pointer;
`

export const LockName = styled.div`
  color: var(--link);
  font-weight: 600;
`

export const LockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  white-space: nowrap;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LockDuration = styled.div`
`

export const LockKeys = styled.div`
`

const LockPanel = styled.div`
  grid-column: 1 / span 7;
`

const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
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

/* Saving for use with sub-values that need to be added in a future PR
const LockValueSub = styled.div`
  font-size: 0.6em;
  color: var(--grey);
  margin-top: 5px;
`
*/
