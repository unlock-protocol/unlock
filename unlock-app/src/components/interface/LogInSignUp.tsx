import React from 'react'
import BrowserOnly from '../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'
import FinishSignUp from './FinishSignup'

interface Props {
  login?: boolean
  signup?: boolean
  emailAddress?: string
}

interface State {
  signup: boolean
}

export default class LogInSignUp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { signup, login } = props
    this.state = {
      signup: signup || !login,
    }
  }

  toggleSignup = () => {
    this.setState(prevState => ({
      ...prevState,
      signup: !prevState.signup,
    }))
  }

  render() {
    const { signup } = this.state
    const { emailAddress } = this.props
    return (
      <BrowserOnly>
        {!signup && <LogIn toggleSignup={this.toggleSignup} />}
        {signup && !emailAddress && <SignUp toggleSignup={this.toggleSignup} />}
        {signup && emailAddress && <FinishSignUp emailAddress={emailAddress} />}
      </BrowserOnly>
    )
  }
}
