import React from 'react'
import { storiesOf } from '@storybook/react'
import { Header } from '../../components/interface/Header'

storiesOf('Header', module).add('the header', () => {
  return <Header title="Roses are red" />
})
