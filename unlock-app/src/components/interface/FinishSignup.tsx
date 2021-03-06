import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import { SetPassword } from './SetPassword'
import SignupSuccess from './SignupSuccess'
import UnlockUser from '../../structured_data/unlockUser'
import WedlockServiceContext from '../../contexts/WedlocksContext'
import { StorageService } from '../../services/storageService'
import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '../../utils/accounts'
import { ConfigContext } from '../../utils/withConfig'

interface Props {
  emailAddress: string
}

export const FinishSignup = ({ emailAddress }: Props) => {
  const config = useContext(ConfigContext)
  const wedlockService = useContext(WedlockServiceContext)

  const storageService = new StorageService(config.services.storage.host)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const signup = async (password: string) => {
    setLoading(true)
    const {
      address,
      passwordEncryptedPrivateKey,
    } = await createAccountAndPasswordEncryptKey(password)
    try {
      const user = await storageService.createUser(
        UnlockUser.build({
          emailAddress,
          publicKey: address,
          passwordEncryptedPrivateKey,
        }),
        emailAddress,
        password
      )

      const recoveryKey = await reEncryptPrivateKey(
        passwordEncryptedPrivateKey,
        password,
        user.recoveryPhrase
      )

      const { origin } = window.location

      if (wedlockService) {
        wedlockService.welcomeEmail(
          emailAddress,
          `${origin}/recover/?email=${encodeURIComponent(
            emailAddress
          )}&recoveryKey=${encodeURIComponent(JSON.stringify(recoveryKey))}`
        )
      }
      setSuccess(true)
    } catch (error) {
      setError('There was an error creating your account. Please try again.')
      console.error(error)
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
  height: 60px;
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
