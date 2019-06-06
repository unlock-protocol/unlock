import React from 'react'
import { Section, SectionHeader, Item, Column } from './styles'

// TODO: add dispatch, current account data
interface PasswordProps {}

interface PasswordState {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export class ChangePassword extends React.Component<
  PasswordProps,
  PasswordState
> {
  constructor(props: PasswordProps) {
    super(props)
    /* this.state = {
     *   currentPassword: '',
     *   newPassword: '',
     *   confirmNewPassword: '',
     * } */
  }

  noop() {}

  render() {
    return (
      <React.Fragment>
        <SectionHeader>Change Password</SectionHeader>
        <Section>
          <Column>
            {/* text inputs go here */}
            <Item title="Old Password">old password input</Item>
            <Item title="New Password">new password input</Item>
            <Item title="Confirm New Password">confirm new password input</Item>
          </Column>
          <Column>{/* button goes here */}</Column>
        </Section>
      </React.Fragment>
    )
  }
}

// TODO: connect to state and dispatch
export default ChangePassword
