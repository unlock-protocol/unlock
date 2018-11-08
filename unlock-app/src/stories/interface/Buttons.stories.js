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
  .add('About Large', () => {
    return (
      <Buttons.About size="56px" />
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
