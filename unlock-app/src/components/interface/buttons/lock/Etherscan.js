import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class Etherscan extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Etherscan />
      </LockButton>
    )
  }
}
