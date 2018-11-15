import React from 'react'
import Svg from '../../svg'
import { LockButton } from '../Button'

const Withdraw = (props) => {
  return (
    <LockButton title='Withdraw balance' {...props}>
      <Svg.Withdraw name="Withdraw" />
    </LockButton>
  )
}

export default Withdraw
