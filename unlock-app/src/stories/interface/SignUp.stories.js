import React from 'react'
import { storiesOf } from '@storybook/react'

import { SignUp } from '../../components/interface/SignUp'

const signupEmail = jest.fn()

storiesOf('SignUp page', module).add('The SignUp Page', () => {
  return <SignUp signupEmail={signupEmail} />
})
