import React from 'react'
import { storiesOf } from '@storybook/react'

import { AuthenticationPrompt } from '../../components/interface/AuthenticationPrompt'

storiesOf('Authentication Prompt', module).add('The Prompt', () => {
  return <AuthenticationPrompt />
})
