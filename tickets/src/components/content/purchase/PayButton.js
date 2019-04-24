import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import withConfig from '../../../utils/withConfig'
import UnlockPropTypes from '../../../propTypes'
import Media from '../../../theme/media'

export const PayButton = ({ transaction, purchaseKey, config }) => {
  const { requiredConfirmations } = config
  if (
    transaction &&
    ['submitted', 'pending'].indexOf(transaction.status) > -1
  ) {
    return <PayInfo>Payment Sent ...</PayInfo>
  } else if (
    transaction &&
    transaction.status === 'mined' &&
    transaction.confirmations < requiredConfirmations
  ) {
    return (
      <PayInfo>
        Confirming Payment ({transaction.confirmations} /{' '}
        {requiredConfirmations})
      </PayInfo>
    )
  } else if (transaction && transaction.status === 'mined') {
    return <PayInfo>Confirmed</PayInfo>
  } else {
    return <Pay onClick={purchaseKey}>Pay &amp; Register for This Event</Pay>
  }
}

PayButton.propTypes = {
  transaction: UnlockPropTypes.transaction,
  config: UnlockPropTypes.configuration.isRequired,
  purchaseKey: PropTypes.func.isRequired,
}

PayButton.defaultProps = {
  transaction: null,
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
