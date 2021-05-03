import React from 'react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { storiesOf } from '@storybook/react'
import HeaderTitle from '../../components/interface/HeaderTitle'

storiesOf('HeaderTitle', module).add('header title', () => {
  return <HeaderTitle title="Roses are red" />
})
