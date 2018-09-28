import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class Code extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Code fill={'var(--grey)'} />
      </LockButton>
    )
  }
}
