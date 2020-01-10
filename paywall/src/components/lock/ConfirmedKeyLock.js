import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  ExpirationDuration,
} from './LockStyles'
import ConfirmedKey, {
  Checkmark,
  Arrow,
  ConfirmedKeyButton,
} from '../interface/buttons/overlay/ConfirmedKey'
import { HoverFooter, NotHoverFooter } from './HoverFooters'
import Duration from '../helpers/Duration'
import withConfig from '../../utils/withConfig'
import { currencySymbolForLock } from '../../utils/locks'
import { expirationAsText } from '../../utils/durations'
import Media from '../../theme/media'

const ConfirmedKeyLock = ({ lock, onClick, config }) => {
  const currency = currencySymbolForLock(lock, config)

  return (
    <LockWrapper lock={lock} onClick={onClick}>
      <LockHeader>{lock.name}</LockHeader>
      <Body onClick={onClick}>
        <EthPrice>
          {lock.keyPrice} {currency}
        </EthPrice>
        <LockDetail>
          <ExpirationDuration>
            <Duration seconds={lock.expirationDuration} round />
          </ExpirationDuration>
        </LockDetail>
        <ConfirmedKey size="50px" onClick={onClick} />
        <NotHoverFooter backgroundColor="var(--green)">
          {expirationAsText(lock.key.expiration)}
        </NotHoverFooter>
        <HoverFooter backgroundColor="var(--green)">Go to Content</HoverFooter>
      </Body>
    </LockWrapper>
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
  color: var(--slate);
  font-weight: bold;
`

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
