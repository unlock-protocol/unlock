import { Button, Input } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { UnlockAccountService, UserDetails } from './unlockAccountMachine'

interface Props {
  unlockAccountService: UnlockAccountService
  signUp(user: UserDetails): void
}

export function SignUp({ unlockAccountService, signUp }: Props) {
  const [state, send] = useActor(unlockAccountService)
  const { email } = state.context
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
      await signUp({ email, password })
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
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="space-y-4">
          <h3 className="font-bold">
            Oh hey, you are new in town! Got a strong password in mind?
            Let&apos;s set it up, shall we?
          </h3>
          <form
            id="confirmPassword"
            className="space-y-2"
            onSubmit={handleSubmit(onSubmit)}
          >
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
                minLength: {
                  value: 8,
                  message: 'Password should be 8 characters long at least.',
                },
              })}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="confirm"
              required
              size="small"
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
