import React from 'react'
import { storiesOf } from '@storybook/react'
import { Icon } from '../../components/lock/Icon'

storiesOf('Icon', Icon)
  .add('with a falsy lock address', () => {
    const address = ''
    return <Icon address={address} />
  })
  .add('with a lock address', () => {
    const address = '0xa62142888aba8370742be823c1782d17a0389da1'
    return <Icon address={address} />
  })
  .add('with a different lock address', () => {
    const address = '0xc3672ef6721d1151699a8acd2072d529e73c6662'
    return <Icon address={address} />
  })
