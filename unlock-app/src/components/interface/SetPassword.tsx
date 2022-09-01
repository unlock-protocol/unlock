import { Button, Input } from '@unlock-protocol/ui'
import React, { useReducer } from 'react'
import { FaSpinner as Spinner } from 'react-icons/fa'
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

    return (
      <Button type="submit" disabled={!isValid || loading}>
        <div className="flex items-center">
          {loading && <Spinner className="mr-1 animate-spin" />}
          <span>
            {loading ? buttonLabel || 'Creating Account...' : 'Submit'}
          </span>
        </div>
      </Button>
    )
  }

  const { errors } = state

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <Input
          label="Password"
          required
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleInputChange}
        />
        <Input
          label="Confirm password"
          required
          name="passwordConfirmation"
          type="password"
          placeholder="Confirm Password"
          onChange={handleInputChange}
        />
        {errors.map((error: string) => (
          <p className="px-1 text-red-500" key={error}>
            {error}
          </p>
        ))}
        {submitButton()}
      </div>
    </form>
  )
}

export default SetPassword
