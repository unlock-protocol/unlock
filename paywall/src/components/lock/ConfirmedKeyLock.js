import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import { LockWrapper, LockHeader, LockBody } from './LockStyles'
import ConfirmedKey, {
  Checkmark,
  Arrow,
  ConfirmedKeyButton,
} from '../interface/buttons/overlay/ConfirmedKey'
import { HoverFooter, NotHoverFooter } from './HoverFooters'
import BalanceProvider from '../helpers/BalanceProvider'
import Duration from '../helpers/Duration'
import withConfig from '../../utils/withConfig'
import { currencySymbolForLock } from '../../utils/locks'
import { expirationAsText } from '../../utils/durations'
import Media from '../../theme/media'

const ConfirmedKeyLock = ({ lock, onClick, config }) => {
  const convertCurrency = !lock.currencyContractAddress
  let currency = currencySymbolForLock(lock, config)

  return (
    <BalanceProvider
      convertCurrency={convertCurrency}
      amount={lock.keyPrice}
      render={(ethPrice, fiatPrice) => (
        <LockWrapper lock={lock} onClick={onClick}>
          <LockHeader>{lock.name}</LockHeader>
          <Body onClick={onClick}>
            <EthPrice>
              {ethPrice} {currency}
            </EthPrice>
            <LockDetail>
              {convertCurrency && <FiatPrice>${fiatPrice}</FiatPrice>}
              <ExpirationDuration>
                <Duration seconds={lock.expirationDuration} round />
              </ExpirationDuration>
            </LockDetail>
            <ConfirmedKey size="50px" onClick={onClick} />
            <NotHoverFooter backgroundColor="var(--green)">
              {expirationAsText(lock.key.expiration)}
            </NotHoverFooter>
            <HoverFooter backgroundColor="var(--green)">
              Go to Content
            </HoverFooter>
          </Body>
        </LockWrapper>
      )}
    />
  )
}

ConfirmedKeyLock.propTypes = {
  onClick: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(ConfirmedKeyLock)

const LockDetail = styled.div``

const EthPrice = styled.div.attrs({
  className: 'price',
})`
  font-size: 30px;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: bold;
`

const LockPriceDetails = styled.span`
  font-size: 20px;
  font-weight: 300;
  color: var(--grey);
`

const FiatPrice = styled(LockPriceDetails)`
  ::after {
    color: var(--lightgrey);
    content: ' | ';
  }
`

const ExpirationDuration = styled(LockPriceDetails)``

const Body = styled(LockBody)`
  cursor: pointer;
  padding-top: 13px;
  ${HoverFooter} {
    display: none;
  }
  ${NotHoverFooter} {
    display: grid;
    background-color: var(--white);
    color: var(--green);
  }
  ${ConfirmedKeyButton} {
    display: none;
  }
  &:hover {
    grid-template-rows: 20px 60px 30px;
    ${ConfirmedKeyButton} {
      background-color: var(--green);
      & svg {
        fill: var(--white);
      }
    }
    ${ConfirmedKeyButton} {
      display: block;
    }
    ${EthPrice} {
      display: none;
    }
    ${LockDetail} span {
      font-size: 15px;
    }
    ${FiatPrice} {
      font-weight: bold;
    }
    ${Arrow} {
      display: none;
    }
    ${Checkmark} {
      display: block;
    }
    ${HoverFooter} {
      display: grid;
      background-color: var(--white);
      color: var(--green);
    }
    ${NotHoverFooter} {
      display: none;
    }
  }
  ${Media.phone`
    grid-template-rows: 20px 60px 30px;
    ${EthPrice} {
      display: none;
    }
    ${ConfirmedKeyButton} {
      display: block;
    }
    ${Arrow} {
      display: none;
    }
    ${Checkmark} {
      display: block;
    }
  `}
`
