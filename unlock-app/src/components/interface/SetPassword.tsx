import React from 'react'
import styled from 'styled-components'
import { LoadingButton } from './user-account/styles'

export interface Credentials {
  emailAddress: string
  password: string
}

interface Props {
  buttonLabel: string
  emailAddress: string
  onSubmit: (credentials: Credentials) => any
}

interface State {
  password: string
  passwordConfirmation: string
  errors: string[]
  isValid: boolean
  submitted: boolean
}

export const passwordErrors = {
  EMPTY: 'Password must not be empty.',
  NO_MATCH: 'Password and confirmation must match.',
  MID_LENGTH:
    'We recommend using a more complex password (8 characters at the absolute minimum).',
}

export const validatePassword = (
  password: string,
  passwordConfirmation: string
) => {
  const errors: string[] = []

  if (password.length < 1) {
    errors.push(passwordErrors.EMPTY)
  }

  if (password.length < 8) {
    errors.push(passwordErrors.MID_LENGTH)
  }

  // TODO: better calculation of best-case password complexity.
  // TODO: augment complexity calculation with calls to HaveIBeenPwned API.

  if (password !== passwordConfirmation) {
    errors.push(passwordErrors.NO_MATCH)
  }

  return errors
}

export class SetPassword extends React.Component<Props, State> {
  /* eslint-disable react/static-property-placement */
  static defaultProps = {
    buttonLabel: 'Creating Account',
  }
  /* eslint-enable react/static-property-placement */

  constructor(props: Props) {
    super(props)
    this.state = {
      password: '',
      passwordConfirmation: '',
      errors: [],
      isValid: false,
      submitted: false,
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target

    this.setState((prevState) => {
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
    const { emailAddress, onSubmit } = this.props
    const { password, passwordConfirmation } = this.state
    const errors = validatePassword(password, passwordConfirmation)

    // Last sanity check to make sure nobody messed with the DOM attr
    const isValid = !errors.length
    if (isValid) {
      onSubmit({ emailAddress, password })
    }

    this.setState({
      submitted: true,
    })
  }

  submitButton = () => {
    const { buttonLabel } = this.props
    const { submitted, isValid } = this.state
    if (submitted) {
      return <LoadingButton>{buttonLabel}...</LoadingButton>
    }

    return <SubmitButton type="submit" value="Submit" disabled={!isValid} />
  }

  render = () => {
    const { errors } = this.state

    return (
      <Form onSubmit={this.handleSubmit}>
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
        {this.submitButton()}
      </Form>
    )
  }
}

export default SetPassword

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
  color: white;
  &[disabled] {
    background-color: var(--grey);
    cursor: not-allowed;
    color: white;
  }
`

const Form = styled.form`
  max-width: 450px;
`

const PasswordError = styled.span`
  height: 30px;
  line-height: 30px;
`
