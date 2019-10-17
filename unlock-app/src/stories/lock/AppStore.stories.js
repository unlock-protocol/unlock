import React from 'react'
import { storiesOf } from '@storybook/react'
import { AppStore } from '../../components/creator/lock/AppStore'

const config = {}

storiesOf('AppStore', module).add('with sample lock', () => {
  const lock = {
    address: '0xa62142888aba8370742be823c1782d17a0389da1',
  }
  return <AppStore lock={lock} config={config} />
})
