import React from 'react'
import { storiesOf } from '@storybook/react'
import LeftHeader from '../../components/interface/LeftHeader'

storiesOf('LeftHeader', module).add('header, no icons', () => {
  return <LeftHeader title="Roses are red" />
})
