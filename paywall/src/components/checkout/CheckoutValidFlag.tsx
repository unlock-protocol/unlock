import React from 'react'
import styled from 'styled-components'

import Media from '../../theme/media'
import { Key } from '../../unlockTypes'
//import Svg from '../interface/svg'
import { WordMarkLogo } from '../interface/Logo'
import { OptimisticFlag, OptimisticLogo, PoweredByUnlock } from './FlagStyles'
import { expirationAsDate } from '../../utils/durations'

interface Props {
  unlockKey: Key
  showModal: () => void
}

export default function ConfirmedFlag({ unlockKey, showModal }: Props) {
  const expirationDate = new Date(unlockKey.expiration)
  return (
    <ClickableFlag onClick={() => showModal()}>
      <p>
        <span>You&apos;re&nbsp;</span>
        <span>Subscribed</span>
      </p>
      <ClickableDate onClick={showModal}>
        Valid until {expirationAsDate(expirationDate.getTime())}
      </ClickableDate>
      <PoweredByUnlock>
        <p>Powered by</p>
        <a href="/">
          <OptimisticLogo>
            <WordMarkLogo alt="Unlock" />
          </OptimisticLogo>
        </a>
      </PoweredByUnlock>
    </ClickableFlag>
  )
}

const ClickableDate = styled.button`
  grid-column: 1;
  grid-row: 2;
  font-family: IBM Plex Sans, Sans Serif;
  font-size: 12px;
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
  width: 315px;
  justify-content: space-between;
  & > p {
    font-size: 12px;
    margin: 0;
    color: var(--darkgrey);
    & span:first-child {
      display: none;
    }
  }
  ${Media.phone`
    padding: 0 10px 0 10px;
    background-color: var(--lightgrey);
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 30px;
    & > p {
      display: flex;
      flex-direction: row;
      font-weight: bold;
      grid-column: 1;
      grid-row: 1;
      text-align: left;
      align-self: end;
      & span:first-child {
        display: block;
      }
    }
    & ${ClickableDate} {
      grid-column: 1;
      grid-row: 2;
      align-self: start;
      text-align: left;
    }
    & ${PoweredByUnlock} {
      grid-column: 2;
      grid-row: 2;
      align-self: start;
      justify-self: end;
      & ${OptimisticLogo} {
        margin: 0 0 -2px 2px;
      }
    }
  `}
`
