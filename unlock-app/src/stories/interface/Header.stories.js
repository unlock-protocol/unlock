import React from 'react'
import { storiesOf } from '@storybook/react'
import Header from '../../components/interface/Header'

storiesOf('Header', Header)
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
  .add('the header for a content page', () => {
    return (
      <Header forContent={true} title="Roses are red" />
    )
  })
