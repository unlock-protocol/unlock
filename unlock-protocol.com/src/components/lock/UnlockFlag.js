import styled from 'styled-components'
import React from 'react'

import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'
import Media from '../../theme/media'

export function LockedFlag() {
  return (
    <Colophon>
      <RoundedLogo size="28px" />
      <p>Powered by Unlock</p>
    </Colophon>
  )
}

export const UnlockedFlag = () => (
  <Flag id="UnlockFlag">
    <RoundedLogo size="28px" />
    <p>Subscribed with Unlock</p>
  </Flag>
)

const Flag = styled(Colophon)`
  float: right;
  box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  opacity: 0.5;
  transition: opacity 0.4s ease-in;
  margin-right: 0;
  &:hover {
    opacity: 1;
    transition: opacity 0.4s ease-in;
  }

  ${Media.phone`
    display: none;
  `}
`
