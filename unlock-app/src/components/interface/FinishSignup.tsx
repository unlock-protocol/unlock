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
}

export class FinishSignup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      password: '',
      passwordConfirmation: '',
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target

    this.setState(prevState => ({
      ...prevState,
      [name]: value,
    }))
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { emailAddress, signupCredentials } = this.props
    const { password } = this.state
    // TODO: Actually validate this before submitting.
    signupCredentials({ emailAddress, password })
  }

  render = () => {
    const { emailAddress } = this.props
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
          <SubmitButton type="submit" value="Submit" />
        </form>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => ({
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
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
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
  margin-top: 25px;
  font-size: 16px;
  cursor: pointer;
`
