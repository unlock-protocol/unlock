import React from 'react'
import BrowserOnly from '../helpers/BrowserOnly'
import LogIn from './LogIn'
import SignUp from './SignUp'

interface Props {
  login?: boolean
  signup?: boolean
  embedded?: boolean
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
    const { embedded } = this.props
    const { signup } = this.state
    return (
      <BrowserOnly>
        {!signup && (
          <LogIn toggleSignup={this.toggleSignup} embedded={embedded} />
        )}
        {signup && (
          <SignUp toggleSignup={this.toggleSignup} embedded={embedded} />
        )}
      </BrowserOnly>
    )
  }
}
