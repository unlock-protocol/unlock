import { Button, Input } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { UnlockAccountService, UserDetails } from './unlockAccountMachine'

interface Props {
  unlockAccountService: UnlockAccountService
  signIn(user: UserDetails): void
}

export function SignIn({ unlockAccountService, signIn }: Props) {
  const [state, send] = useActor(unlockAccountService)
  const { email } = state.context
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
        email,
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
    <div className="h-full flex flex-col justify-between">
      <main className="px-6 pb-2 space-y-2 overflow-auto h-full">
        <h3 className="font-bold ml-0.5">Please enter your password</h3>
        <form id="password" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Password"
            type="password"
            size="small"
            placeholder="password"
            required
            error={errors?.password?.message as unknown as string}
            {...register('password', {
              required: true,
            })}
          />
        </form>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
        <Button
          disabled={isSigningIn}
          loading={isSigningIn}
          type="submit"
          form="password"
          className="w-full"
        >
          {isSigningIn ? 'Signing in' : 'Sign in'}
        </Button>
        <PoweredByUnlock />
      </footer>
    </div>
  )
}
