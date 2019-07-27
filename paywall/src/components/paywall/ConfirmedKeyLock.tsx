import React from 'react'
import styled from 'styled-components'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  LockDetails,
  LockDetail,
} from './LockStyles'
import ConfirmedKey, {
  Checkmark,
  Arrow,
  ConfirmedKeyButton,
} from '../interface/buttons/overlay/ConfirmedKey'
import { HoverFooter, NotHoverFooter } from './HoverFooters'
import BalanceProvider from '../helpers/BalanceProvider'
import withConfig from '../../utils/withConfig'
import { currencySymbolForLock } from '../../utils/locks'
import { Lock, UnlockConfig } from '../../unlockTypes'

type ConfirmedProps = {
  lock: Lock
  onClick: () => void
  config: UnlockConfig
}

const ConfirmedKeyLock = ({ lock, onClick, config }: ConfirmedProps) => {
  const convertCurrency = !lock.currencyContractAddress
  let currency = currencySymbolForLock(lock, config)

  return (
    <LockWrapper lock={lock}>
      <LockHeader>{lock.name}</LockHeader>
      <Body onClick={onClick}>
        <BalanceProvider
          convertCurrency={convertCurrency}
          amount={lock.keyPrice}
          render={(ethPrice: string, fiatPrice: string) => (
            <React.Fragment>
              <LockDetails>
                <LockDetail bold>
                  {ethPrice} {currency}
                </LockDetail>
                {convertCurrency && <LockDetail>${fiatPrice}</LockDetail>}
              </LockDetails>
            </React.Fragment>
          )}
        />
        <ConfirmedKey size="50px" onClick={onClick} />
        <NotHoverFooter backgroundColor="var(--green)">
          Payment Confirmed
        </NotHoverFooter>
        <HoverFooter backgroundColor="var(--green)">Go to Content</HoverFooter>
      </Body>
    </LockWrapper>
  )
}

export default withConfig(ConfirmedKeyLock)

const Body = styled(LockBody)`
  border: 1px solid var(--green);
  cursor: pointer;
  ${HoverFooter} {
    display: none;
  }
  ${NotHoverFooter} {
    display: grid;
  }
  &:hover {
    ${ConfirmedKeyButton} {
      background-color: var(--green);
      & svg {
        fill: var(--white);
      }
    }
    ${Arrow} {
      display: block;
    }
    ${Checkmark} {
      display: none;
    }
    ${HoverFooter} {
      display: grid;
    }
    ${NotHoverFooter} {
      display: none;
    }
  }
`
