import styled from 'styled-components'
import React, { useEffect, useState } from 'react'

import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'
import Media from '../../theme/media'
import { SHOW_FLAG_FOR } from '../../constants'

export function LockedFlag() {
  return (
    <Colophon>
      <p>Powered by</p>
      <RoundedLogo size="28px" />
      <a href="/">Unlock</a>
    </Colophon>
  )
}

export const UnlockedFlag = () => {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHidden(true)
    }, SHOW_FLAG_FOR)
    return () => clearTimeout(timeout)
  }, [setHidden])
  return (
    <Flag id="UnlockFlag" hidden={hidden}>
      <RoundedLogo size="28px" />
      <p>
        Subscribed with&nbsp;
        <a href="/">Unlock</a>
      </p>
    </Flag>
  )
}

const Flag = styled(Colophon)`
  float: right;
  box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  margin-right: 0;
  ${props => (props.hidden ? 'opacity: 0.5;' : 'opacity: 1;')}

  transition: opacity 0.4s ease-in;
  &:hover {
    opacity: 1;
    transition: opacity 0.4s ease-in;
  }
  & a {
    color: var(--red);
  }

  ${Media.phone`
    display: flex;
    background-color: var(--white);
    box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.08);
    grid-row: 2;
    grid-column: 1;
    width: 120px;
    align-self: center;
    justify-self: center;
    height: 50px;
    margin-right: -33px;
    flex-direction: row;
    float: none;
    margin-right: auto;
    margin-left: auto;
  
    & > div {
      display: block;
    }
    & > p {
      width: 63px;
      display: block;
      grid-row: 2;
    }
    opacity: 1;
  `}
`
