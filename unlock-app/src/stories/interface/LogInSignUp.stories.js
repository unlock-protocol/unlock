import React from 'react'
import { storiesOf } from '@storybook/react'
import doNothing from '../../utils/doNothing'
import LogIn from '../../components/interface/LogIn'
import SignUp from '../../components/interface/SignUp'
import { FinishSignup } from '../../components/interface/FinishSignup'
import { InvalidLink } from '../../components/interface/InvalidLink'
import { SignupSuccess } from '../../components/interface/SignupSuccess'
import LogInSignUp from '../../components/interface/LogInSignUp'

storiesOf('LogInSignUp/Components', module)
  .add('LogIn', () => {
    return <LogIn toggleSignup={doNothing} errors={[]} />
  })
  .add('SignUp', () => {
    return <SignUp />
  })
  .add('FinishSignUp', () => {
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
  .add('InvalidLink', () => {
    return <InvalidLink />
  })
  .add('SignupSuccess', () => {
    return <SignupSuccess />
  })
const account = {
  address: '0x123',
  balance: '0',
}

storiesOf('LogInSignUp', module)
  .add('Login', () => <LogInSignUp login />)
  .add('Login (error)', () => <LogInSignUp login />)
  .add('SignUp', () => <LogInSignUp signup />)

storiesOf('SignUp', module)
  .add('SignUp', () => <SignUp />)
  .add('FinishSignUp', () => (
    <SignUp emailAddress="geoff@bitconnect.gov" isLinkValid />
  ))
  .add('InvalidLink', () => (
    <SignUp emailAddress="geoff@bitconnect.gov" isLinkValid={false} />
  ))
  .add('SignupSuccess', () => <SignUp signup account={account} />)
