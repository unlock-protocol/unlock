import React, { useState } from 'react'
import styled from 'styled-components'
import { SetPassword } from './SetPassword'
import SignupSuccess from './SignupSuccess'

import { useAccount } from '../../hooks/useAccount'

interface Props {
  emailAddress: string
  onSuccess: (
    email: string,
    password: string,
    passwordEncryptedPrivateKey: any
  ) => void
}

export const FinishSignup = ({ emailAddress, onSuccess }: Props) => {
  const { createUserAccount } = useAccount('', 1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const signup = async (password: string) => {
    setLoading(true)
    try {
      const account = await createUserAccount(emailAddress, password)
      if (onSuccess) {
        onSuccess(emailAddress, password, account)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError('There was a problem creating your account')
    }
    setLoading(false)
  }

  if (success) {
    return <SignupSuccess />
  }
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
        loading={loading}
        buttonLabel="Creating Account"
        onSubmit={signup}
      />
      {error && <SignupError>{error}</SignupError>}
    </div>
  )
}
export default FinishSignup

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
  height: 48px;
  width: 100%;
  max-width: 450px;
  border: none;
  background-color: var(--lightgrey);
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
`

export const SignupError = styled.p`
  color: var(--red);
  margin-bottom: 5px;
  margin-top: 5px;
`
