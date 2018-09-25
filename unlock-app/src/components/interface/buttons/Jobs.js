import Icons from '../icons'
import React, { PureComponent } from 'react'
import { LayoutButton } from './Button'

export default class Jobs extends PureComponent {
  render() {
    return (
      <LayoutButton href="/jobs" title="Join us">
        <Icons.Jobs fill={'white'} />
      </LayoutButton>
    )
  }
}
