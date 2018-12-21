import React from 'react'
import { storiesOf } from '@storybook/react'
import { EmbedCodeSnippet } from '../../components/creator/lock/EmbedCodeSnippet'

storiesOf('LockCodeSnippet', module).add('with sample lock', () => {
  const lock = {
    address: '0xa62142888aba8370742be823c1782d17a0389da1',
  }
  return <EmbedCodeSnippet lock={lock} />
})
