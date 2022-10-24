import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Input,
  Label,
  LoadingButton,
  NeutralButton,
  Button,
} from '../checkout/FormStyles'

interface SignupFormInterface {
  email?: string
  password?: string
}

interface SignUpProps {
  onCancel?: () => any
  createAccount: (email: string, password: string) => any
  showLogin: () => any
}

export const SignUp = ({ onCancel, createAccount, showLogin }: SignUpProps) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async ({ email, password }: SignupFormInterface) => {
    if (!email || !password) {
      return false
    }
    setLoading(true)
    try {
      await createAccount(email, password)
    } catch (error: any) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>Email</Label>
      <Input
        autoComplete="username"
        placeholder="Enter your email"
        {...register('email', { required: true })}
      />
      <Label>Set a password</Label>
      <Input
        autoComplete="new-password"
        type="password"
        placeholder="Choose a password"
        {...register('password', { required: true })}
      />
      {loading && <LoadingButton>Saving</LoadingButton>}
      {!loading && <Button type="submit">Save</Button>}
      {onCancel && <NeutralButton onClick={onCancel}>Cancel</NeutralButton>}
      {error && error !== 'ACCOUNT_ALREADY_EXISTS' && (
        <>There was an error trying to create your account. Please try again.</>
      )}
      {error && error === 'ACCOUNT_ALREADY_EXISTS' && (
        <>
          An account with this email already exists,{' '}
          <a className="cursor-pointer" onClick={() => showLogin()}>
            please login
          </a>
          .
        </>
      )}
    </form>
  )
}

SignUp.defaultProps = {
  onCancel: null,
}
