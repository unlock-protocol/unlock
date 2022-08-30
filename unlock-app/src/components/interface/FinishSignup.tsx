import React, { useState } from 'react'
import styled from 'styled-components'
import { SetPassword } from './SetPassword'
import SignupSuccess from './SignupSuccess'

import { useAccount } from '../../hooks/useAccount'
import { Input } from '@unlock-protocol/ui'

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
    } catch (error: any) {
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
      <div className="flex flex-col w-1/2">
        <Input
          name="emailPlaceholder"
          type="email"
          label="Email"
          value={emailAddress}
          disabled
        />
        <SetPassword
          loading={loading}
          buttonLabel="Creating Account"
          onSubmit={signup}
        />
      </div>
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

export const SignupError = styled.p`
  color: var(--red);
  margin-bottom: 5px;
  margin-top: 5px;
`
