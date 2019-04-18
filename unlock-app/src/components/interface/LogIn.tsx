// eslint-disable-next-line no-unused-vars
import React, { FormEvent } from 'react'
import styled from 'styled-components'
//import { connect } from 'react-redux'

interface Props {}
interface State {
  emailAddress: string
  password: string
  submitted: boolean
}

export class LogIn extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    /* eslint-disable react/no-unused-state */
    this.state = {
      emailAddress: '',
      password: '',
      submitted: false,
    }
    /* eslint-enable react/no-unused-state */
  }

  handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  render = () => {
    return (
      <div>
        <Heading>Log In to Your Account</Heading>
        <Description>Don&#39;t have an account? Sign up here.</Description>
        <form onSubmit={this.handleSubmit}>
          <Input
            name="emailAddress"
            type="email"
            placeholder="Enter your email"
          />
          <br />
          <Input
            name="password"
            type="password"
            placeholder="Enter your password"
          />
          <br />
          <SubmitButton type="submit" value="Submit" />
        </form>
      </div>
    )
  }
}

export default LogIn

const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 20px;
  color: var(--darkgrey);
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
