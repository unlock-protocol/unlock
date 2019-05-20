import React from 'react'
import { connect } from 'react-redux'
import { Dispatch, EncryptedPrivateKey } from '../../../unlockTypes' // eslint-disable-line
import { MessageBox, Cancel, Submit, Input } from './styles'
import { dismissResetPasswordPrompt } from '../../../actions/fullScreenModals'
import { changePassword } from '../../../actions/user'

interface Props {
  dispatch: Dispatch
  email: string
}

interface State {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// TODO: Generalize this into a class that can be extended?
export class ResetPasswordPrompt extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }
  }

  submit = () => {
    const { dispatch } = this.props
    const { currentPassword, newPassword } = this.state
    dispatch(changePassword(currentPassword, newPassword))
    this.dismiss()
  }

  dismiss = () => {
    const { dispatch } = this.props
    dispatch(dismissResetPasswordPrompt())
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value, name },
    } = event
    this.setState(prevState => ({
      ...prevState,
      [name]: value,
    }))
  }

  handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event
    if (key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      this.submit()
    }

    if (key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this.dismiss()
    }
  }

  render() {
    const { email } = this.props
    const { currentPassword, newPassword, confirmNewPassword } = this.state
    // TODO: Port validation from normal password selection and handle button styling.
    const disabled = !(
      newPassword === confirmNewPassword && newPassword.length >= 8
    )
    return (
      <MessageBox>
        <p>
          To change your password, please enter your current password and the
          desired new password.
        </p>
        <Input type="email" value={email} placeholder="Password" disabled />
        <Input
          type="password"
          name="currentPassword"
          value={currentPassword}
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
          placeholder="Current Password"
          autoFocus
        />
        <Input
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
          placeholder="New Password"
        />
        <Input
          type="password"
          name="confirmNewPassword"
          value={confirmNewPassword}
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
          placeholder="Confirm New Password"
        />
        <div>
          <Cancel onClick={this.dismiss}>Cancel</Cancel>
          <Submit disabled={disabled} onClick={this.submit}>
            Submit
          </Submit>
        </div>
      </MessageBox>
    )
  }
}

interface ReduxState {
  userDetails: {
    key: EncryptedPrivateKey
    email: string
  }
}

export const mapStateToProps = (state: ReduxState) => {
  const { email } = state.userDetails
  return {
    email,
  }
}

export default connect(mapStateToProps)(ResetPasswordPrompt)
