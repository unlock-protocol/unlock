import Icons from '../icons'
import React, { PureComponent } from 'react'
import { LayoutButton } from './Button'

export default class Github extends PureComponent {
  render() {
    return (
      <LayoutButton href="https://github.com/unlock-protocol/unlock" title="Source Code">
        <Icons.Github fill={'white'} />
      </LayoutButton>
    )
  }
}
