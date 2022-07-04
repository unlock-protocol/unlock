import { Button, Input } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { UnlockAccountService, UserDetails } from './unlockAccountMachine'
import { RiArrowLeftLine as LeftArrowIcon } from 'react-icons/ri'

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
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              aria-label="back"
              onClick={(event) => {
                event.preventDefault()
                send('BACK')
              }}
            >
              <LeftArrowIcon
                className="group-hover:fill-brand-ui-primary group-hover:-translate-x-1 group-disabled:translate-x-0 duration-300 ease-out transition-transform group-disabled:transition-none group-disabled:group-hover:fill-black"
                size={20}
              />
            </button>
            <h3 className="font-bold">
              Nice to see you again! Please enter the password you created
              previously
            </h3>
          </div>

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
