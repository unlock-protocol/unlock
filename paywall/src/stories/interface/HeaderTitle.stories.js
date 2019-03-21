import React from 'react'
import { storiesOf } from '@storybook/react'
import HeaderTitle from '../../components/interface/HeaderTitle'

storiesOf('HeaderTitle', module).add('header title', () => {
  return <HeaderTitle title="Roses are red" />
})
