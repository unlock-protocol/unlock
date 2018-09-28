import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class ExportLock extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Export />
      </LockButton>
    )
  }
}
