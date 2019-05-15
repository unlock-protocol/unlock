import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import createUnlockStore from '../../createUnlockStore'
import doNothing from '../../utils/doNothing'
import { signupEmail } from '../../actions/user'
import { LogIn } from '../../components/interface/LogIn'
import { SignUp } from '../../components/interface/SignUp'
import { FinishSignup } from '../../components/interface/FinishSignup'
import { InvalidLink } from '../../components/interface/InvalidLink'
import { SignupSuccess } from '../../components/interface/SignupSuccess'
import LogInSignUp from '../../components/interface/LogInSignUp'

storiesOf('LogInSignUp/Components', module)
  .add('LogIn', () => {
    return <LogIn toggleSignup={doNothing} />
  })
  .add('SignUp', () => {
    return <SignUp signupEmail={signupEmail} />
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
const store = createUnlockStore()

const account = {
  address: '0x123',
  balance: '0',
}

storiesOf('LogInSignUp', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('LogIn', () => <LogInSignUp login />)
  .add('SignUp', () => <LogInSignUp signup />)

storiesOf('SignUp', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('SignUp', () => <SignUp />)
  .add('FinishSignUp', () => (
    <SignUp emailAddress="geoff@bitconnect.gov" isLinkValid />
  ))
  .add('InvalidLink', () => (
    <SignUp emailAddress="geoff@bitconnect.gov" isLinkValid={false} />
  ))
  .add('SignupSuccess', () => <SignUp signup account={account} />)
