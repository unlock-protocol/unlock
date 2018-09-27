import React from 'react'
import { storiesOf } from '@storybook/react'
import { Demo } from '../../components/lock/Demo'

storiesOf('Demo', Demo)
  .add('with a lock address', () => {
    const address = '0xa62142888aba8370742be823c1782d17a0389da1'
    return (
      <Demo address={address} />
    )
  })
