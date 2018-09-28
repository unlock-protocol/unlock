import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LayoutButton } from '../Button'

export default class Github extends PureComponent {
  render() {
    return (
      <LayoutButton href="https://github.com/unlock-protocol/unlock" title="Source Code">
        <Svg.Github fill={'white'} />
      </LayoutButton>
    )
  }
}
