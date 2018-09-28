import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LockButton } from '../Button'

export default class Edit extends PureComponent {
  render() {
    return (
      <LockButton>
        <Svg.Edit fill={'var(--grey)'} />
      </LockButton>
    )
  }
}
