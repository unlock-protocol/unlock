// eslint-disable-next-line no-unused-vars
import React, { FormEvent } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
// eslint-disable-next-line no-unused-vars
import { Account } from '../../unlockTypes'
import SignupSuccess from './SignupSuccess'
// eslint-disable-next-line no-unused-vars
import { loginCredentials, Credentials } from '../../actions/user'
import { LoadingButton } from './user-account/styles'
import { UnlockError, WarningError, isWarningError } from '../../utils/Error'
import { resetError } from '../../actions/error'

interface Props {
  toggleSignup: () => void
  loginCredentials: (credentials: Credentials) => void
  account?: Account
  errors: WarningError[]
  close: (e: WarningError) => void
  embedded?: boolean
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
    // TODO: Validation for empty fields, etc?
    const { loginCredentials } = this.props
    const { emailAddress, password } = this.state
    e.preventDefault()
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
  }

  submitButton = () => {
    const { submitted } = this.state
    const { errors } = this.props

    if (submitted) {
      return <LoadingButton>Logging In...</LoadingButton>
    }
    if (errors.length) {
      return (
        <ErrorButton type="submit" value="Retry" onClick={this.handleReset} />
      )
    }

    return <SubmitButton type="submit" value="Submit" />
  }

  render = () => {
    const { account, embedded } = this.props

    if (account && account.address) {
      return <SignupSuccess />
    }

    return (
      <Container>
        {!embedded && <Heading>Log In to Your Account</Heading>}
        <Form onSubmit={this.handleSubmit}>
          <Label htmlFor="emailInput">Email Address</Label>
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
          <br />
          {this.submitButton()}
        </Form>
        <Description>
          Don&#39;t have an account?{' '}
          <LinkButton onClick={this.handleClick}>Sign up here.</LinkButton>
        </Description>
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
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

const mapStateToProps = ({ account, errors }: ReduxState) => {
  const logInWarnings = errors.filter(
    (e) => isWarningError(e) && (e.kind === 'LogIn' || e.kind === 'Storage')
  )

  return {
    account,
    errors: logInWarnings as WarningError[],
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn)

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 16px;
  color: var(--darkgrey);
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

const SubmitButton = styled.input`
  height: 60px;
  width: 100%;
  border: none;
  background-color: var(--green);
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  color: var(--white);
  margin-top: 25px;
`

const ErrorButton = styled(SubmitButton)`
  background-color: var(--red);
`

const Form = styled.form`
  max-width: 600px;
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

const Container = styled.div`
  width: 100%;
`
