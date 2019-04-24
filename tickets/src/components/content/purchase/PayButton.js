import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import withConfig from '../../../utils/withConfig'
import UnlockPropTypes from '../../../propTypes'
import Media from '../../../theme/media'
import { KeyStatus } from '../../../selectors/keys'

export const PayButton = ({ transaction, keyStatus, purchaseKey, config }) => {
  const { requiredConfirmations } = config
  let transactionStatus
  if (transaction && transaction.status) transactionStatus = transaction.status

  if (['submitted', 'pending'].indexOf(transactionStatus) > -1) {
    // Transaction has been submitted
    return <PayInfo>Payment Sent ...</PayInfo>
  } else if (
    // Transaction is confirming
    transactionStatus === 'mined' &&
    transaction.confirmations < requiredConfirmations
  ) {
    return (
      <PayInfo>
        Confirming Payment ({transaction.confirmations} /{' '}
        {requiredConfirmations})
      </PayInfo>
    )
  } else if (keyStatus === KeyStatus.CONFIRMING) {
    // Key is being confirmed but we don't have transaction
    return <PayInfo>Confirming Payment</PayInfo>
  } else if (transactionStatus === 'mined' || keyStatus === KeyStatus.VALID) {
    return <PayInfo>Confirmed</PayInfo>
  } else {
    // No key or transaction
    return <Pay onClick={purchaseKey}>Pay &amp; Register for This Event</Pay>
  }
}

PayButton.propTypes = {
  transaction: UnlockPropTypes.transaction,
  config: UnlockPropTypes.configuration.isRequired,
  purchaseKey: PropTypes.func.isRequired,
  keyStatus: PropTypes.string,
}

PayButton.defaultProps = {
  transaction: null,
  keyStatus: null,
}

export default withConfig(PayButton)

const Pay = styled.div`
  background-color: var(--green);
  border: none;
  font-size: 16px;
  color: var(--white);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: var(--activegreen);
  }
  height: 60px;
  text-align: center;
  padding-top: 20px;
  ${Media.phone`
    margin-bottom: 20px;
  `}
`

const PayInfo = styled(Pay)`
  border: 2px solid var(--green);
  color: var(--green);
  border-radius: 4px;
  background-color: var(--white);
  & :hover {
    background-color: var(--white);
  }
`
