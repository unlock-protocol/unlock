import React from 'react'
import {
  Section,
  SectionHeader,
  Item,
  Column,
  Input,
  SubmitButton,
  DisabledButton,
} from './styles'

// TODO: add dispatch, current account data
interface PasswordProps {}

interface PasswordState {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
  submitted: boolean
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
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target

    this.setState(prevState => ({
      ...prevState,
      [name]: value,
    }))
  }

  handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    this.setState({ submitted: true })
  }

  render() {
    const { submitted } = this.state
    return (
      <React.Fragment>
        <SectionHeader>Change Password</SectionHeader>
        <Section>
          <Column>
            <Item title="Old Password">
              <Input
                name="currentPassword"
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
              />
            </Item>
            <Item title="New Password">
              <Input
                name="newPassword"
                id="newPassword"
                type="password"
                placeholder="Enter your desired new password"
              />
            </Item>
            <Item title="Confirm New Password">
              <Input
                name="confirmNewPassword"
                id="confirmNewPassword"
                type="password"
                placeholder="Confirm your desired new password"
              />
            </Item>
          </Column>
          <Column>
            {!submitted && (
              <SubmitButton onClick={this.handleClick}>
                Update Password
              </SubmitButton>
            )}
            {submitted && <DisabledButton>Submitted</DisabledButton>}
          </Column>
        </Section>
      </React.Fragment>
    )
  }
}

// TODO: connect to state and dispatch
export default ChangePassword
