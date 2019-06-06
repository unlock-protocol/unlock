import React from 'react'
import styled from 'styled-components'

import Media from '../../theme/media'
import { Key } from '../../unlockTypes'
//import Svg from '../interface/svg'
import { RoundedLogo } from '../interface/Logo'
import {
  OptimisticFlag,
  OptimisticLogo,
  PoweredByUnlock,
  ConfirmedKeyWrapper,
} from './FlagStyles'
import ConfirmedKey, {
  Checkmark,
  Arrow,
  ConfirmedKeyButton,
} from '../interface/buttons/overlay/ConfirmedKey'
import { expirationAsDate } from '../../utils/durations'

interface Props {
  unlockKey: Key
  showModal: () => void
}

export default function ConfirmedFlag({ unlockKey, showModal }: Props) {
  const expirationDate = new Date(unlockKey.expiration)
  return (
    <ClickableFlag onClick={() => showModal()}>
      <OptimisticLogo>
        <RoundedLogo />
      </OptimisticLogo>
      <p>Subscribed with Unlock</p>
      <ClickableDate onClick={showModal}>
        Valid until {expirationAsDate(expirationDate.getTime())}
      </ClickableDate>
      <ConfirmedKeyWrapper>
        <ConfirmedKey height="24px" width="24px" onClick={() => showModal()} />
      </ConfirmedKeyWrapper>
      <PoweredByUnlock>
        <p>Powered by</p>
        <OptimisticLogo>
          <RoundedLogo />
        </OptimisticLogo>
        <a href="/">Unlock</a>
      </PoweredByUnlock>
    </ClickableFlag>
  )
}

const ClickableDate = styled.button`
  grid-column: 1;
  grid-row: 2;
  font-family: Roboto, Sans Serif;
  color: var(--link);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  &:focus {
    outline: none;
  }
`

const ClickableFlag = styled(OptimisticFlag)`
  & p {
    font-family: Roboto, Sans Serif;
    margin: 0;
  }
  & ${ConfirmedKeyWrapper} {
    display: none;
  }
  &:hover {
    cursor: pointer;
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
  }
  ${Media.phone`
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 36px 1fr;
    & > p {
      text-align: right;
      margin-right: 0;
      align-self: end;
      justify-self: start;
    }
    & ${ConfirmedKeyWrapper} {
      display:block;
    }
    & ${ConfirmedKeyWrapper},& ${PoweredByUnlock} {
      grid-row: 2;
      align-self: start;
    }
  `}
`
