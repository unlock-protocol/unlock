import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class Download extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Download fill={'var(--grey)'} />
      </LockButton>
    )
  }
}
