import React from 'react'
import { storiesOf } from '@storybook/react'
import { LogIn } from '../../components/interface/LogIn'
import doNothing from '../../utils/doNothing'

storiesOf('Login Form', module).add('The form', () => {
  return <LogIn toggleSignup={doNothing} />
})
