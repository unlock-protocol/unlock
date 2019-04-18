import React from 'react'
import { storiesOf } from '@storybook/react'
import { LogIn } from '../../components/interface/LogIn'

storiesOf('Login Form', module).add('The form', () => {
  return <LogIn toggleSignup={() => {}} />
})
