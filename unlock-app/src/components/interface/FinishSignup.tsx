import React, { useState } from 'react'
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
      <h1 className="text-4xl font-bold">Create Your Unlock Wallet</h1>
      <p className="text-lg font-light">Create a password for your account.</p>
      <div className="flex flex-col justify-center w-1/2">
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
      {error && <span className="m-1 text-red-500">{error}</span>}
    </div>
  )
}
export default FinishSignup
