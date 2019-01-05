import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import Media from '../../../theme/media'
import withConfig from '../../../utils/withConfig'

export function LockIconBar({
  lock,
  toggleCode,
  transaction,
  withdrawalTransaction,
  config,
}) {
  if (!transaction) {
    // We assume that the lock has been succeesfuly deployed?
    // TODO if the transaction is missing we should try to look it up from the lock address
  } else if (transaction.status === 'submitted') {
    return <CreatorLockStatus lock={lock} status="Submitted" />
  } else if (
    transaction.status === 'mined' &&
    transaction.confirmations < config.requiredConfirmations
  ) {
    return (
      <CreatorLockStatus
        lock={lock}
        status="Confirming"
        confirmations={transaction.confirmations}
      />
    )
  }

  return (
    <StatusBlock>
      <IconBarContainer>
        <IconBar>
          <Buttons.Withdraw as="button" lock={lock} />
          <Buttons.Edit as="button" />
          {/* Reinstate when we're ready <Buttons.ExportLock /> */}
          <Buttons.Code action={toggleCode} as="button" />
        </IconBar>
      </IconBarContainer>
      <SubStatus>
        {withdrawalTransaction &&
          withdrawalTransaction.status === 'submitted' && (
            <>Submitted to Network...</>
        )}
        {withdrawalTransaction &&
          withdrawalTransaction.status === 'mined' &&
          withdrawalTransaction.confirmations <
            config.requiredConfirmations && (
            <>
              Confirming Withdrawal {withdrawalTransaction.confirmations}/
              {config.requiredConfirmations}
            </>
        )}
      </SubStatus>
    </StatusBlock>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  toggleCode: PropTypes.func.isRequired,
  transaction: UnlockPropTypes.transaction,
  withdrawalTransaction: UnlockPropTypes.transaction,
  config: UnlockPropTypes.configuration.isRequired,
}

LockIconBar.defaultProps = {
  transaction: null,
  withdrawalTransaction: null,
}

const mapStateToProps = ({ transactions }, { lock }) => {
  const transaction = transactions[lock.transaction]
  let withdrawalTransaction = null
  Object.keys(transactions).forEach(el => {
    if (
      transactions[el].withdrawal &&
      transactions[el].withdrawal === lock.address
    )
      withdrawalTransaction = transactions[el]
  })
  return {
    transaction,
    withdrawalTransaction,
  }
}

export default withConfig(connect(mapStateToProps)(LockIconBar))

const IconBarContainer = styled.div`
  display: grid;
  justify-items: end;
  padding-right: 24px;
  ${Media.phone`
    display: none;
  `};
`

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(3, 24px);
`

const StatusBlock = styled.div``

const SubStatus = styled.div`
  margin-top: 13px;
  font-size: 10px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: normal;
  color: var(--green);
  text-align: right;
  padding-right: 24px;
`
