import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class Withdraw extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Withdraw fill={'var(--grey)'} />
      </LockButton>
    )
  }
}
