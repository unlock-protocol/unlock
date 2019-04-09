import React from 'react'
import { storiesOf } from '@storybook/react'

import { SignUp } from '../../components/interface/SignUp'

// Just a mock
const signupEmail = email => email

storiesOf('SignUp page', module).add('The SignUp Page', () => {
  return <SignUp signupEmail={signupEmail} />
})
