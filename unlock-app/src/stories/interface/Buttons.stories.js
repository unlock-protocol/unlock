import React from 'react'
import { storiesOf } from '@storybook/react'
import Buttons from '../../components/interface/buttons/layout'

storiesOf('Buttons', Buttons)
  .add('Github', () => {
    return (
      <Buttons.Github />
    )
  })
  .add('About', () => {
    return (
      <Buttons.About />
    )
  })
  .add('Jobs', () => {
    return (
      <Buttons.Jobs />
    )
  })
  .add('Close', () => {
    return (
      <Buttons.Close />
    )
  })
