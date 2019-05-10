import React from 'react'
import { Dispatch } from '../../../unlockTypes' // eslint-disable-line
import { MessageBox, Cancel, Submit, Input } from './styles'
import { dismissPasswordPrompt } from '../../../actions/fullScreenModals'
import { gotPassword } from '../../../actions/user'

interface Props {
  dispatch: Dispatch
}

interface State {
  password: string
}

export default class PasswordPrompt extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      password: '',
    }
  }

  submit = () => {
    const { dispatch } = this.props
    const { password } = this.state
    dispatch(gotPassword(password))
    this.dismiss()
  }

  dismiss = () => {
    const { dispatch } = this.props
    dispatch(dismissPasswordPrompt())
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    this.setState({
      password: value,
    })
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
    const { password } = this.state
    return (
      <MessageBox>
        <p>Please enter your password to complete the transaction.</p>
        <Input
          type="password"
          value={password}
          onChange={this.handleChange}
          onKeyDown={this.handleKey}
          placeholder="Password"
          autoFocus
        />
        <div>
          <Cancel onClick={this.dismiss}>Cancel</Cancel>
          <Submit onClick={this.submit}>Submit</Submit>
        </div>
      </MessageBox>
    )
  }
}
