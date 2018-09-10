import React from 'react'
import { storiesOf } from '@storybook/react'
import Header from '../../components/interface/Header'

storiesOf('Header')
  .add('the header', () => {
    return (
      <Header />
    )
  })
