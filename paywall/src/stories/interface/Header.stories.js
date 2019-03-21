import React from 'react'
import { storiesOf } from '@storybook/react'
import { Header } from '../../components/interface/Header'
import LeftHeader from '../../components/interface/LeftHeader'

storiesOf('Header', module)
  .add('full header', () => {
    return <Header title="Roses are red" />
  })
  .add('header, no icons', () => {
    return <LeftHeader title="Roses are red" />
  })
