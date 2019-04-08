import React from 'react'
import styled from 'styled-components'

export default class AuthenticationPrompt extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {
      emailAddress: '', // eslint-disable-line react/no-unused-state
      password: '', // eslint-disable-line react/no-unused-state
    }
  }

  handleInputChange = (event: any) => {
    const { target } = event
    const { value, name } = target

    this.setState({
      [name]: value,
    })
  }

  handleSubmit = (event: any) => {
    // TODO: dispatch an event here to indicate that we have received credentials
    // TODO: handle failure -> bad password and/or email. Communicate from storageService to here so we can prompt.
    event.preventDefault()
  }

  render = () => (
    <form onSubmit={this.handleSubmit}>
      <Greeting>Please Log In to Continue</Greeting>
      <Label htmlFor="emailAddress">Email address</Label>
      <Input
        name="emailAddress"
        type="email"
        placeholder="Email Address"
        onChange={this.handleInputChange}
      />
      <br />
      <Label htmlFor="password">Password</Label>
      <Input
        name="password"
        type="password"
        placeholder="Password"
        onChange={this.handleInputChange}
      />
      <br />
      <SubmitButton type="submit" value="Submit" />
    </form>
  )
}

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

const Greeting = styled.div`
  font-family: IBM Plex Serif, sans-serif;
  font-size: 24px;
`

const SubmitButton = styled.input`
  height: 60px;
  width: 385px;
  border: none;
  background-color: var(--green);
  border-radius: 4px;
  margin-top: 25px;
  font-size: 16px;
`
