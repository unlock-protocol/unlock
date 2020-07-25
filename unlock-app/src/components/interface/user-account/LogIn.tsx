// eslint-disable-next-line no-unused-vars
import React, { FormEvent } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
// eslint-disable-next-line no-unused-vars
import { Account } from '../../../unlockTypes'
import SignupSuccess from '../SignupSuccess'
// eslint-disable-next-line no-unused-vars
import { loginCredentials, Credentials } from '../../../actions/user'
import { LoadingButton, SubmitButton } from './styles'
import { UnlockError, WarningError, isWarningError } from '../../../utils/Error'
import { resetError } from '../../../actions/error'

interface Props {
  toggleSignup: () => void
  loginCredentials: (credentials: Credentials) => void
  account?: Account
  errors: WarningError[]
  close: (e: WarningError) => void
}

interface State {
  emailAddress: string
  password: string
  submitted: boolean
}

export class LogIn extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    /* eslint-disable react/no-unused-state */
    this.state = {
      emailAddress: '',
      password: '',
      submitted: false,
    }
    /* eslint-enable react/no-unused-state */
  }

  handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.submitLoginCredentials()
  }

  submitLoginCredentials = () => {
    // TODO: Validation for empty fields, etc?
    const { loginCredentials } = this.props
    const { emailAddress, password } = this.state
    loginCredentials({
      emailAddress,
      password,
    })
    this.setState({
      submitted: true, // eslint-disable-line react/no-unused-state
    })
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target

    this.setState((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const { toggleSignup } = this.props
    e.preventDefault()
    toggleSignup()
  }

  handleReset = () => {
    const { errors, close } = this.props
    errors.forEach((e) => close(e))
    this.submitLoginCredentials()
  }

  submitButton = () => {
    const { errors } = this.props
    const { submitted } = this.state

    if (errors.length) {
      return (
        <SubmitButton
          backgroundColor="var(--red)"
          roundBottomOnly
          onClick={this.handleReset}
        >
          Retry Login
        </SubmitButton>
      )
    }
    if (submitted) {
      return <LoadingButton roundBottomOnly>Logging In...</LoadingButton>
    }

    return <InputSubmitButton type="submit" value="Submit" />
  }

  render = () => {
    const { account } = this.props

    if (account && account.address) {
      return <SignupSuccess />
    }

    return (
      <LogInWrapper>
        <Heading>Log In</Heading>
        <form onSubmit={this.handleSubmit}>
          <Indent>
            <Label htmlFor="emailInput">Email</Label>
            <Input
              name="emailAddress"
              id="emailInput"
              type="email"
              placeholder="Enter your email"
              onChange={this.handleInputChange}
            />
            <br />
            <Label htmlFor="passwordInput">Password</Label>
            <Input
              name="password"
              id="passwordInput"
              type="password"
              placeholder="Enter your password"
              onChange={this.handleInputChange}
            />
            <Description>
              Don&#39;t have an account?{' '}
              <LinkButton onClick={this.handleClick}>Sign up here.</LinkButton>
            </Description>
          </Indent>
          <br />
          {this.submitButton()}
        </form>
      </LogInWrapper>
    )
  }
}

export const mapDispatchToProps = (dispatch: any) => ({
  loginCredentials: ({ emailAddress, password }: Credentials) =>
    dispatch(loginCredentials({ emailAddress, password })),
  close: (e: WarningError) => {
    dispatch(resetError(e))
  },
})

interface ReduxState {
  account?: Account
  errors: UnlockError[]
}

export const mapStateToProps = ({ account, errors }: ReduxState) => {
  const logInWarnings = errors.filter(
    (e) => isWarningError(e) && (e.kind === 'LogIn' || e.kind === 'Storage')
  )

  return {
    account,
    errors: logInWarnings as WarningError[],
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn)

const LogInWrapper = styled.div`
  width: 100%;
`

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 15px;
  line-height: 19px;
  font-weight: bold;
  color: var(--darkgrey);
  padding: 24px 32px 24px 32px;
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
  margin: 0;
  color: var(--darkgrey);
  padding-top: 24px;
`

const Input = styled.input`
  height: 60px;
  width: 100%;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`

const InputSubmitButton = styled.input`
  height: 60px;
  width: 100%;
  border: none;
  background-color: var(--green);
  color: var(--white);
  border-radius: 0 0 4px;
  font-size: 16px;
  cursor: pointer;
`

const Label = styled.label`
  display: block;
  text-transform: uppercase;
  font-size: 10px;
  color: var(--darkgrey);
  margin-top: 10px;
  margin-bottom: 5px;
`

const LinkButton = styled.a`
  cursor: pointer;
`

const Indent = styled.div`
  padding: 0 32px;
`
