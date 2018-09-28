import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class Upload extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Upload fill={'var(--grey)'} />
      </LockButton>
    )
  }
}
