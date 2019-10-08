import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { signupCredentials } from '../../actions/user'
import { SetPassword, Credentials } from './SetPassword'

interface Props {
  emailAddress: string
  signupCredentials: (credentials: Credentials) => any
}

export const FinishSignup = ({ emailAddress, signupCredentials }: Props) => {
  return (
    <div>
      <Heading>Create Your Unlock Wallet</Heading>
      <Instructions>Create a password for your account.</Instructions>
      <Label htmlFor="emailPlaceholder">Email</Label>
      <Input
        name="emailPlaceholder"
        type="email"
        id="emailPlaceholder"
        value={emailAddress}
        disabled
      />
      <SetPassword
        buttonLabel="Creating Account"
        emailAddress={emailAddress}
        onSubmit={signupCredentials}
      />
    </div>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  signupCredentials: (credentials: Credentials) =>
    dispatch(signupCredentials(credentials)),
})

export default connect(
  null,
  mapDispatchToProps
)(FinishSignup)

export const Heading = styled.h1`
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 36px;
  line-height: 47px;
  font-weight: bold;
  color: var(--darkgrey);
`

export const Instructions = styled.p`
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 300;
  font-size: 20px;
  color: var(--darkgrey);
`

export const Label = styled.label`
  display: block;
  text-transform: uppercase;
  font-size: 10px;
  color: var(--darkgrey);
  margin-top: 10px;
  margin-bottom: 5px;
`

export const Input = styled.input`
  height: 60px;
  width: 100%;
  max-width: 450px;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`
