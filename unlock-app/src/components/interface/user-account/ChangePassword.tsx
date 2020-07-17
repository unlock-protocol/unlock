import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
  Grid,
  Column,
  DisabledButton,
  Error,
  Input,
  Item,
  SectionHeader,
  SubmitButton,
} from './styles'
import { changePassword } from '../../../actions/user'

// TODO: add dispatch, current account data
interface PasswordProps {
  changePassword: (oldPassword: string, newPassword: string) => any
}

interface PasswordState {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
  submitted: boolean
  errors: string[]
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

export class ChangePassword extends React.Component<
  PasswordProps,
  PasswordState
> {
  constructor(props: PasswordProps) {
    super(props)
    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      submitted: false,
      errors: [],
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target

    this.setState((prevState) => {
      const newState = {
        ...prevState,
        [name]: value,
      }
      const { newPassword, confirmNewPassword } = newState
      const errors = validatePassword(newPassword, confirmNewPassword)

      return {
        ...newState,
        errors,
      }
    })
  }

  handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmNewPassword } = this.state
    const { changePassword } = this.props
    const errors = validatePassword(newPassword, confirmNewPassword)

    // Last sanity check to make sure nobody messed with the DOM attr
    const isValid = !errors.length
    if (isValid) {
      changePassword(currentPassword, newPassword)
      this.setState({ submitted: true })
    } else {
      // TODO: set an error here
    }
  }

  render() {
    const { submitted, errors } = this.state
    return (
      <Grid>
        <SectionHeader>Change Password</SectionHeader>
        <Column size="half">
          <Item title="Old Password">
            <Input
              name="currentPassword"
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              onChange={this.handleInputChange}
            />
          </Item>
          <Item title="New Password">
            <Input
              name="newPassword"
              id="newPassword"
              type="password"
              placeholder="Enter your desired new password"
              onChange={this.handleInputChange}
            />
          </Item>
          <Item title="Confirm New Password">
            <Input
              name="confirmNewPassword"
              id="confirmNewPassword"
              type="password"
              placeholder="Confirm your desired new password"
              onChange={this.handleInputChange}
            />
          </Item>
        </Column>
        <Column size="half">
          <Error>{errors.length ? errors[0] : ''}</Error>
          {!submitted && (
            <Submit onClick={this.handleClick}>Update Password</Submit>
          )}
          {submitted && <DisabledButton>Submitted</DisabledButton>}
        </Column>
      </Grid>
    )
  }
}

export const mapDispatchToProps = (dispatch: any) => ({
  changePassword: (oldPassword: string, newPassword: string) =>
    dispatch(changePassword(oldPassword, newPassword)),
})

// TODO: connect to state and dispatch
export default connect(null, mapDispatchToProps)(ChangePassword)

const Submit = styled(SubmitButton)`
  margin-bottom: 1rem;
  margin-top: 13px;
`
