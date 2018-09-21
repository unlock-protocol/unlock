import Icons from '../icons'
import React, { PureComponent } from 'react'
import { LayoutButton } from './Button'

export default class Github extends PureComponent {
  render() {
    return (
      <LayoutButton href="https://github.com/unlock-protocol/unlock">
        <Icons.Github fill={'white'} />
      </LayoutButton>
    )
  }
}
