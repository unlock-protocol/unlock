import { Button, Input } from '@unlock-protocol/ui'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import {
  UnlockAccountSend,
  UnlockAccountState,
  UserDetails,
} from './unlockAccountMachine'

interface Props {
  state: UnlockAccountState
  send: UnlockAccountSend
  signIn(user: UserDetails): void
}

export function SignIn({ state, send, signIn }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm()
  const [isSigningIn, setIsSigningIn] = useState(false)
  async function onSubmit({ password }: FieldValues) {
    setIsSigningIn(true)
    try {
      await signIn({
        email: state.context.email,
        password,
      })
      setIsSigningIn(false)
      send('CONTINUE')
    } catch (error) {
      if (error instanceof Error) {
        setError(
          'password',
          {
            type: 'value',
            message: error.message,
          },
          {
            shouldFocus: true,
          }
        )
      }
      setIsSigningIn(false)
    }
  }

  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-96">
        <div className="space-y-4">
          <h3 className="font-bold">
            Nice to see you again! Please enter the password you created
            previously
          </h3>
          <form id="password" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Password"
              type="password"
              size="small"
              placeholder="password"
              required
              error={errors?.password?.message}
              description={'Enter your password'}
              {...register('password', {
                required: true,
              })}
            />
          </form>
        </div>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Button
          disabled={isSigningIn}
          loading={isSigningIn}
          type="submit"
          form="password"
          className="w-full"
        >
          {isSigningIn ? 'Signing in' : 'Sign in'}
        </Button>
      </footer>
    </div>
  )
}
