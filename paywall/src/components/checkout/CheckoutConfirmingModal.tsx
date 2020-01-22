import styled from 'styled-components'
import React from 'react'

import { Lock, Account } from '../../unlockTypes'
import Media from '../../theme/media'
import CheckoutLock from './CheckoutLock'
import ActionButton from '../interface/buttons/ActionButton'
import { LockHeader, LockWrapper } from '../lock/LockStyles'

interface Props {
  confirmingLock: Lock
  account: Account | null
  hideCheckout: (...args: any[]) => any
}

export const CheckoutConfirmingModal = ({
  confirmingLock,
  account,
  hideCheckout,
}: Props) => {
  const noTitleLock = {
    ...confirmingLock,
  }
  delete noTitleLock.name
  return (
    <>
      <Content>
        <CheckoutLock
          lock={noTitleLock}
          account={account}
          disabled
          purchase={() => {}}
          hideCheckout={hideCheckout}
        />
        <div>
          <p>
            Your transaction was sent and is currently being confirmed on the
            Ethereum blockchain. Please enjoy our content while it is
            confirming!
          </p>
          <Status>You&apos;ll see the status of your order on the left.</Status>
          <Continue onClick={hideCheckout}>Continue</Continue>
        </div>
      </Content>
    </>
  )
}

export default CheckoutConfirmingModal

const Continue = styled(ActionButton)`
  width: 100%;
  height: 60px;
  ${Media.phone`
    width: 100%;
  `}
`

const Status = styled.p`
  ${Media.phone`
  display: none;
`}
`

const Content = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding: 0;
  margin: 0;
  & ${LockWrapper} {
    grid-template-rows: 4px 140px;
  }
  & ${LockHeader} {
    height: 0;
  }
  & > div {
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0 0 0 24px;
    & > .lock {
      width: 20%;
    }
    & > p {
      margin-top: 0;
      font-size: 20px;
    }
  }
  ${Media.phone`
    flex-flow: column;
    place-items: center;
    & > div {
      padding: 16px 0 16px;
      & > p {
        margin: 0 10px 10px 10px;
        font-size: 16px;
      }
    }
  `}
`
