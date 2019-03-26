import React from 'react'
import { connect } from 'react-redux'

import { RoundedLogo } from '../interface/Logo'
import {
  OptimisticFlag,
  OptimisticLogo,
  ProgressBar,
  Progress,
  FlagContent,
} from './FlagStyles'
import { TRANSACTION_TYPES } from '../../constants'
import withConfig from '../../utils/withConfig'
import UnlockPropTypes from '../../propTypes'

export function ConfirmingFlag({
  config: { requiredConfirmations },
  transaction,
}) {
  let text = 'Powered by Unlock'
  let Confirmations = null
  if (transaction) {
    text = 'Confirming Purchase'
    Confirmations = (
      <ProgressBar>
        <Progress
          requiredConfirmations={requiredConfirmations}
          confirmations={transaction.confirmations}
        />
      </ProgressBar>
    )
  }
  return (
    <OptimisticFlag>
      <OptimisticLogo>
        <RoundedLogo size="28px" />
      </OptimisticLogo>
      <FlagContent>
        <p>{text}</p>
        {Confirmations}
      </FlagContent>
    </OptimisticFlag>
  )
}

ConfirmingFlag.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
  transaction: UnlockPropTypes.transaction.isRequired,
}

export const mapStateToProps = (state, { lock }) => {
  const account = state.account

  // If there is no account (probably not loaded yet), we do not want to create a key
  if (!account) {
    return {}
  }

  let lockKey = Object.values(state.keys).find(
    key => key.lock === lock.address && key.owner === account.address
  )
  let transaction = null

  if (!lockKey) {
    lockKey = {
      lock: lock.address,
      owner: account.address,
    }
  }

  // Let's select the transaction corresponding to this key purchase, if it exists
  // This transaction is of type KEY_PURCHASE
  transaction = Object.values(state.transactions).find(
    transaction =>
      transaction.type === TRANSACTION_TYPES.KEY_PURCHASE &&
      transaction.key === lockKey.id
  )

  return {
    transaction,
  }
}

export default withConfig(connect(mapStateToProps)(ConfirmingFlag))
