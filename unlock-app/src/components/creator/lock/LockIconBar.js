import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'
import CreatorLockStatus from './CreatorLockStatus'
import withConfig from '../../../utils/withConfig'

export function LockIconBar({ lock, toggleCode, transaction, config }) {
  if (!transaction) {
    // We assume that the lock has been succeesfuly deployed?
    // TODO if the transaction is missing we should try to look it up from the lock address
  } else if (transaction.status === 'submitted') {
    return (
      <CreatorLockStatus lock={lock} status="Submitted" />
    )
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
    <IconBarContainer>
      <IconBar>
        <Buttons.Withdraw as="button" />
        <Buttons.Edit as="button" />
        {/* Reinstate when we're ready <Buttons.ExportLock /> */}
        <Buttons.Code action={toggleCode} as="button" />
      </IconBar>
    </IconBarContainer>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  toggleCode: PropTypes.func.isRequired,
  transaction: UnlockPropTypes.transaction,
  config: UnlockPropTypes.configuration.isRequired,
}

LockIconBar.defaultProps = {
  transaction: null,
}

const mapStateToProps = (state, { lock }) => {
  const transaction = state.transactions[lock.transaction]
  return {
    transaction,
  }
}

export default withConfig(connect(mapStateToProps)(LockIconBar))

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
