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
const store = createUnlockStore()

storiesOf('LogInSignUp', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('LogIn', () => <LogInSignUp login />)
  .add('SignUp', () => <LogInSignUp signup />)
  .add('FinishSignUp', () => (
    <LogInSignUp signup emailAddress="geoff@bitconnect.gov" />
  ))
