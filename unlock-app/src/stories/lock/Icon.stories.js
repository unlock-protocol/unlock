import React from 'react'
import { storiesOf } from '@storybook/react'
import { Icon } from '../../components/lock/Icon'

storiesOf('Icon')
  .add('with a lock address', () => {
    const address = '0xa62142888aba8370742be823c1782d17a0389da1'
    return (
      <Icon address={address} />
    )
  })
  .add('with a different lock address', () => {
    const address = '0xc3672ef6721d1151699a8acd2072d529e73c6662'
    return (
      <Icon address={address} />
    )
  })
  .add('with a 3rd lock address on a larger size', () => {
    const address = '0x328111e735807be2843e6eff619d5d6e00e2b3bc'
    return (
      <Icon address={address} size={3} />
    )
  })
