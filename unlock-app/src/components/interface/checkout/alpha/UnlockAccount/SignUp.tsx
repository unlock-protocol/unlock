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
  signUp(user: UserDetails): void
}

export function SignUp({ state, send, signUp }: Props) {
  const [isSigningUp, setIsSigningUp] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  async function onSubmit({ password, confirmedPassword }: FieldValues) {
    try {
      setIsSigningUp(true)
      if (password !== confirmedPassword) {
        throw new Error('Password does not match')
      }
      await signUp({ email: state.context.email, password })
      setIsSigningUp(false)
      send('CONTINUE')
    } catch (error) {
      if (error instanceof Error) {
        setError(
          'confirmedPassword',
          {
            type: 'value',
            message: error.message,
          },
          {
            shouldFocus: true,
          }
        )
      }
      setIsSigningUp(false)
    }
  }

  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-96">
        <div className="space-y-4">
          <h3 className="font-bold">
            Oh hey, you are new in town! Got a strong password in mind?
            Let&apos;s set it up, shall we?
          </h3>
          <form id="confirmPassword" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Password"
              type="password"
              placeholder="password"
              required
              size="small"
              error={errors?.password?.message}
              description="Enter your password"
              {...register('password', {
                required: true,
              })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="confirm"
              required
              error={errors?.confirmedPassword?.message}
              description="Retype your password to confirm"
              {...register('confirmedPassword', {
                required: true,
              })}
            />
          </form>
        </div>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Button
          loading={isSigningUp}
          disabled={isSigningUp}
          type="submit"
          form="confirmPassword"
          className="w-full"
        >
          {isSigningUp ? 'Creating Account' : 'Create Account'}
        </Button>
      </footer>
    </div>
  )
}
