import Icons from '../icons'
import React, { PureComponent } from 'react'
import { LayoutButton } from './Button'

export default class About extends PureComponent {
  render() {
    return (
      <LayoutButton href="/about" title="About">
        <Icons.About fill={'white'} />
      </LayoutButton>
    )
  }
}
