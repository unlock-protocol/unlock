import React from 'react'
import { storiesOf } from '@storybook/react'
import { FinishSignup } from '../../components/interface/FinishSignup'

storiesOf('Finish Signup', module).add('The form', () => {
  return (
    <FinishSignup
      emailAddress="geoff@bitconnect.gov"
      signupCredentials={({ emailAddress, password }) => ({
        emailAddress,
        password,
      })}
    />
  )
})
