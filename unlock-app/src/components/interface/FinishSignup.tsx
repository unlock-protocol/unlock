import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { signupCredentials } from '../../actions/signUp'

export interface Credentials {
  emailAddress: string
  password: string
}

interface Props {
  emailAddress: string
  signupCredentials: (credentials: Credentials) => any
}

interface State {
  password: string
  passwordConfirmation: string
  errors: string[]
  isValid: boolean
}

export const passwordErrors = {
  EMPTY: 'Password must not be empty.',
  NO_MATCH: 'Password and confirmation must match.',
}

export const validatePassword = (
  password: string,
  passwordConfirmation: string
) => {
  let errors: string[] = []

  if (password.length < 1) {
    errors.push(passwordErrors.EMPTY)
  }

  if (password !== passwordConfirmation) {
    errors.push(passwordErrors.NO_MATCH)
  }

  return errors
}

export class FinishSignup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      password: '',
      passwordConfirmation: '',
      errors: [],
      isValid: false,
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target

    this.setState(prevState => {
      const newState = {
        ...prevState,
        [name]: value,
      }
      const { password, passwordConfirmation } = newState
      const errors = validatePassword(password, passwordConfirmation)

      return {
        ...newState,
        errors,
        isValid: !errors.length,
      }
    })
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { emailAddress, signupCredentials } = this.props
    const { password, passwordConfirmation } = this.state
    const errors = validatePassword(password, passwordConfirmation)

    // Last sanity check to make sure nobody messed with the DOM attr
    const isValid = !errors.length
    if (isValid) {
      signupCredentials({ emailAddress, password })
    }
  }

  render = () => {
    const { emailAddress } = this.props
    const { isValid, errors } = this.state

    return (
      <div>
        <Heading>Create Your Unlock Wallet</Heading>
        <Instructions>
          Create a password for your account: {emailAddress}.
        </Instructions>
        <form onSubmit={this.handleSubmit}>
          <Label htmlFor="passwordInput">Password</Label>
          <Input
            name="password"
            type="password"
            id="passwordInput"
            placeholder="Password"
            onChange={this.handleInputChange}
          />
          <br />
          <Label htmlFor="passwordConfirmationInput">Confirm Password</Label>
          <Input
            name="passwordConfirmation"
            type="password"
            id="passwordConfirmationInput"
            placeholder="Confirm Password"
            onChange={this.handleInputChange}
          />
          <br />
          <PasswordError>{errors.length ? errors[0] : ''}</PasswordError>
          <br />
          <SubmitButton type="submit" value="Submit" disabled={!isValid} />
        </form>
      </div>
    )
  }
}

export const mapDispatchToProps = (dispatch: any) => ({
  signupCredentials: (credentials: Credentials) =>
    dispatch(signupCredentials(credentials)),
})

export default connect(
  null,
  mapDispatchToProps
)(FinishSignup)

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

const Instructions = styled.p`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 300;
  font-size: 20px;
  color: var(--darkgrey);
`

const Label = styled.label`
  display: block;
  text-transform: uppercase;
  font-size: 10px;
  color: var(--darkgrey);
  margin-top: 10px;
  margin-bottom: 5px;
`

const Input = styled.input`
  height: 60px;
  width: 385px;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`

const SubmitButton = styled.input`
  height: 60px;
  width: 385px;
  border: none;
  background-color: var(--green);
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  &[disabled] {
    background-color: var(--grey);
    cursor: not-allowed;
    color: black;
  }
`

const PasswordError = styled.span`
  height: 30px;
  line-height: 30px;
`
