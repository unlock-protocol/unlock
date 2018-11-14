import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

export function Withdraw(props) {
  return (
    <LockButton title='Withdraw balance' {...props}>
      <Svg.Withdraw name="Withdraw" />
    </LockButton>
  )
}

export default Withdraw
