import React from 'react'
import BrowserOnly from '../../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'

// TODO: This is duplicated to allow switching between paywall-specific login
// and signup components. There may be a better way.

interface Props {
  login?: boolean
  signup?: boolean
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
    this.setState((prevState) => ({
      ...prevState,
      signup: !prevState.signup,
    }))
  }

  render() {
    const { signup } = this.state
    return (
      <BrowserOnly>
        {!signup && <LogIn toggleSignup={this.toggleSignup} />}
        {signup && <SignUp toggleSignup={this.toggleSignup} />}
      </BrowserOnly>
    )
  }
}
