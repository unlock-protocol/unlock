import React from 'react'
import { storiesOf } from '@storybook/react'
import { LockCodeSnippet } from '../../components/creator/lock/LockCodeSnippet'

storiesOf('LockCodeSnippet', LockCodeSnippet)
  .add('with sample lock', () => {
    const lock = {
      address: '0xa62142888aba8370742be823c1782d17a0389da1',

    }
    return (
      <LockCodeSnippet lock={lock} />
    )
  })
