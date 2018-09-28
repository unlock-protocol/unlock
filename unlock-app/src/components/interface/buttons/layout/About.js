import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LayoutButton } from '../Button'

export default class About extends PureComponent {
  render() {
    return (
      <LayoutButton href="/about" title="About">
        <Svg.About fill={'white'} />
      </LayoutButton>
    )
  }
}
