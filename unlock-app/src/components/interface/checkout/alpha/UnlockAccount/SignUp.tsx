import { Button, Input } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { UnlockAccountService, UserDetails } from './unlockAccountMachine'
import { RiArrowLeftLine as LeftArrowIcon } from 'react-icons/ri'

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
          <div className="flex items-center gap-2">
            <button
              className="group"
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
              Oh hey, you are new in town! Got a strong password in mind?
              Let&apos;s set it up, shall we?
            </h3>
          </div>
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
              error={errors?.password?.message as any as string}
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
              error={errors?.confirmedPassword?.message as any as string}
              description="Retype your password to confirm"
              {...register('confirmedPassword', {
                required: true,
              })}
            />
          </form>
        </div>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
        <Button
          loading={isSigningUp}
          disabled={isSigningUp}
          type="submit"
          form="confirmPassword"
          className="w-full"
        >
          {isSigningUp ? 'Creating Account' : 'Create Account'}
        </Button>
        <PoweredByUnlock />
      </footer>
    </div>
  )
}
