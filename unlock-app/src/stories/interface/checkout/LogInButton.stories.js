import React from 'react'
import { storiesOf } from '@storybook/react'
import { LogInButton } from '../../../components/interface/checkout/LogInButton'
import doNothing from '../../../utils/doNothing'

storiesOf('Checkout Login Button', module).add('Login button', () => {
  return <LogInButton onClick={doNothing} />
})
