import React from 'react'
import { storiesOf } from '@storybook/react'
import Logo from '../../components/interface/Logo'

storiesOf('Logo', Logo)
  .add('Logo', () => {
    return (
      <Logo />
    )
  })
