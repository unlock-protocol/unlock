import styled from 'styled-components'
import React, { useEffect, useState } from 'react'

import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'
import Media from '../../theme/media'
import { SHOW_FLAG_FOR } from '../../constants'

export function LockedFlag() {
  return (
    <Colophon>
      <RoundedLogo size="28px" />
      <p>Powered by Unlock</p>
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
      <p>Subscribed with Unlock</p>
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

  ${Media.phone`
    display: flex;
`}
`
