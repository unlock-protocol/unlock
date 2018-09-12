import React from 'react'
import { storiesOf } from '@storybook/react'
import Header from '../../components/interface/Header'

storiesOf('Header')
  .add('the header without a title', () => {
    return (
      <Header />
    )
  })
  .add('the header with a title', () => {
    return (
      <Header title="Roses are red" />
    )
  })
