import React, { useReducer } from 'react'
import styled from 'styled-components'
import { LoadingButton } from './user-account/styles'
import { Button } from './checkout/FormStyles'

interface Props {
  buttonLabel: string
  loading: boolean
  onSubmit: (password: string) => any
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

  if (passwordConfirmation && password !== passwordConfirmation) {
    errors.push(passwordErrors.NO_MATCH)
  }

  return errors
}

interface ReducerState {
  password: string
  passwordConfirmation: string
  errors: string[]
}

interface ReducerActionChange {
  name: string
  value: string | string[]
}
interface ReducerAction {
  change?: ReducerActionChange[]
}

const reducer = (state: ReducerState, action: ReducerAction) => {
  if (action.change) {
    const newState = { ...state } as any
    action.change.forEach((change: ReducerActionChange) => {
      newState[change.name] = change.value
    })
    return newState
  }
  return { ...state }
}

const defaultState = {
  password: '',
  passwordConfirmation: '',
  errors: [],
}

export const SetPassword = ({ buttonLabel, onSubmit, loading }: Props) => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target
    const { password, passwordConfirmation } = state

    let errors
    if (name === 'passwordConfirmation') {
      errors = validatePassword(password, value)
    } else {
      errors = validatePassword(value, passwordConfirmation)
    }
    dispatch({
      change: [
        { value, name },
        { name: 'errors', value: errors },
      ],
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { password } = state
    onSubmit(password)
  }

  const submitButton = () => {
    const { errors } = state
    const isValid = errors.length === 0
    if (loading) {
      return (
        <LoadingButton>{buttonLabel || 'Creating Account'}...</LoadingButton>
      )
    }

    return (
      <Button type="submit" disabled={!isValid}>
        Submit
      </Button>
    )
  }

  const { errors } = state

  return (
    <Form onSubmit={handleSubmit}>
      <Label htmlFor="passwordInput">Password</Label>
      <input
        required
        name="password"
        type="password"
        id="passwordInput"
        placeholder="Password"
        onChange={handleInputChange}
      />
      <br />
      <Label htmlFor="passwordConfirmationInput">Confirm Password</Label>
      <input
        required
        name="passwordConfirmation"
        type="password"
        id="passwordConfirmationInput"
        placeholder="Confirm Password"
        onChange={handleInputChange}
      />
      <br />
      {errors.map((error: string) => (
        <PasswordError key={error}>{error}</PasswordError>
      ))}
      <br />
      {submitButton()}
    </Form>
  )
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

const Form = styled.form`
  max-width: 450px;
`

const PasswordError = styled.p`
  color: var(--red);
  margin-bottom: 5px;
  margin-top: 5px;
`
