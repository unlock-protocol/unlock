import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import withConfig from '../../../utils/withConfig'
import Buttons from '../../interface/buttons/lock'
import UnlockPropTypes from '../../../propTypes'

const LockIconBar = ({ withdraw, toggleCode, withdrawalTransaction, config }) => {
  return (
    <StatusBlock>
      <IconBarContainer>
        <IconBar>
          {!withdraw &&
          <Buttons.Withdraw action={withdraw} backgroundColor='var(--green)' fillColor='white' as="button" />
          }
          {withdraw &&
          <Buttons.Withdraw action={withdraw} as="button" />
          }
          <Buttons.Edit as="button" />
          { /* Reinstate when we're ready <Buttons.ExportLock /> */ }
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

LockIconBar.propTypes = {
  toggleCode: PropTypes.func.isRequired,
  withdraw: PropTypes.func.isRequired,
  withdrawalTransaction: UnlockPropTypes.transaction.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(LockIconBar)

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
