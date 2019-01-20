import React from 'react'
import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'

export default function LockedFlag() {
  return (
    <Colophon>
      <RoundedLogo size="28px" />
      <p>Powered by Unlock</p>
    </Colophon>
  )
}
