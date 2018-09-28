import Svg from '../../svg'
import React, { PureComponent } from 'react'
import { LayoutButton } from '../Button'

export default class Jobs extends PureComponent {
  render() {
    return (
      <LayoutButton href="/jobs" title="Join us">
        <Svg.Jobs fill={'white'} />
      </LayoutButton>
    )
  }
}
