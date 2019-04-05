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
      <RoundedLogo />
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
      <RoundedLogo />
      <p>Powered by</p>
      <a href="/">Unlock</a>
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
    background-color: var(--offwhite);
    align-self: center;
    justify-self: center;
    height: 43px;
    float: none;
  
    opacity: 1;
  `}
`
