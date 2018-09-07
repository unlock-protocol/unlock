import React from 'react'
import { storiesOf } from '@storybook/react'
import { HeaderIcon } from '../../components/interface/HeaderIcon'

storiesOf('HeaderIcon')
  .add('with the Github Icon', () => {
    return (
      <HeaderIcon type="github" />
    )
  })
  .add('with the Jobs Icon', () => {
    return (
      <HeaderIcon type="jobs" />
    )
  })
  .add('with the About Icon', () => {
    return (
      <HeaderIcon type="about" />
    )
  })
