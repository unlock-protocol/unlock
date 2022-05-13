import React, { ReactNode, useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { FieldValues, useForm } from 'react-hook-form'
import useAccount from '~/hooks/useAccount'
import { useStorageService } from '~/utils/withStorageService'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import UnlockProvider from '~/services/unlockProvider'
import { useConfig } from '~/utils/withConfig'
import { Bottom } from './Bottom'

interface EmailProps {
  onSubmitEmail(email: string): Promise<void>
}

function Email({ onSubmitEmail }: EmailProps) {
  const { register, handleSubmit } = useForm()

  async function onSubmit({ email }: FieldValues) {
    await onSubmitEmail(email)
  }

  return (
    <>
      <header className="px-6">
        <h1 className="font-bold text-lg"> Sign in / up </h1>
        <p> Let&apos;s start with your email address </p>
      </header>
      <main>
        <form
          className="p-6 space-y-4"
          id="email"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="Email"
            type="email"
            placeholder="julien@unlock-protocol.com"
            required
            message="If you have previously created account with Unlock, please enter the same email to contine"
            {...register('email', {
              required: true,
            })}
          />
        </form>
      </main>
      <Bottom>
        <Button type="submit" form="email" className="w-full">
          Next
        </Button>
      </Bottom>
    </>
  )
}

interface PasswordProps {
  onSubmitPassword(password: string): Promise<void>
}

function Password({ onSubmitPassword }: PasswordProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm()
  const [loading, setLoading] = useState(false)

  async function onSubmit({ password }: FieldValues) {
    setLoading(true)
    try {
      await onSubmitPassword(password)
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
    }
    setLoading(false)
  }

  return (
    <>
      <header className="px-6">
        <h1 className="font-bold text-lg"> Sign In </h1>
        <p>
          Nice to see you again! Please enter the password you created
          previously
        </p>
      </header>
      <main>
        <form
          className="p-6 space-y-4"
          id="password"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="Password"
            type="password"
            placeholder="password"
            required
            state={errors?.password ? 'error' : undefined}
            message={errors?.password?.message || 'Enter your password'}
            {...register('password', {
              required: true,
            })}
          />
        </form>
      </main>
      <Bottom>
        <Button
          disabled={loading}
          type="submit"
          form="password"
          className="w-full"
        >
          {loading ? 'Signing in' : 'Sign in'}
        </Button>
      </Bottom>
    </>
  )
}

interface ConfirmPasswordProps {
  onSubmitConfirmedPassword(password: string): void
}

function ConfirmPassword({ onSubmitConfirmedPassword }: ConfirmPasswordProps) {
  const { register, handleSubmit, setError } = useForm()

  function onSubmit({ password, confirmedPassword }: FieldValues) {
    if (password !== confirmedPassword) {
      setError('confirmedPassword', {
        type: 'validate',
        message: 'Password does not match',
      })
    }
    onSubmitConfirmedPassword(password)
  }

  return (
    <>
      <header className="px-6">
        <h1 className="font-bold text-lg"> Sign Up </h1>
        <p>
          Oh hey, you are new in town! Got a strong password in mind? Let&apos;s
          set it up, shall we?
        </p>
      </header>
      <main>
        <form
          className="p-6 space-y-4"
          id="confirmPassword"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="Password"
            type="password"
            placeholder="password"
            required
            message="Enter your password"
            {...register('password', {
              required: true,
            })}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="confirm"
            required
            message="Retype your password to confirm"
            {...register('confirmedPassword', {
              required: true,
            })}
          />
        </form>
      </main>
      <Bottom>
        <Button type="submit" form="confirmPassword" className="w-full">
          Create Account
        </Button>
      </Bottom>
    </>
  )
}

interface Props {
  onSignedIn(): void
  injectedProvider: unknown
}

type SignInOrUpState = 'email' | 'password' | 'confirmPassword'

export function SignInOrUp({ onSignedIn, injectedProvider }: Props) {
  const [state, setState] = useState<SignInOrUpState>('email')
  const [emailAddress, setEmailAddress] = useState<string>()
  const config = useConfig()
  const { retrieveUserAccount, createUserAccount } = useAccount('', 1)
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const storageService = useStorageService()

  const onSubmitEmail = async (email: string) => {
    const existingUser = await storageService.userExist(email)
    setEmailAddress(email)
    if (existingUser) {
      setState('password')
    } else {
      setState('confirmPassword')
    }
  }

  const onSubmitPassword = async (password: string) => {
    if (!emailAddress) {
      return setState('email')
    }
    const unlockProvider = await retrieveUserAccount(emailAddress, password)
    await authenticateWithProvider('UNLOCK', unlockProvider)
    onSignedIn()
  }

  const onSubmitConfirmedPassword = async (password: string) => {
    if (!emailAddress) {
      return setState('email')
    }
    const { passwordEncryptedPrivateKey } = await createUserAccount(
      emailAddress,
      password
    )
    const unlockProvider = new UnlockProvider(config.networks[1])
    await unlockProvider.connect({
      key: passwordEncryptedPrivateKey,
      emailAddress,
      password,
    })

    await authenticateWithProvider('UNLOCK', unlockProvider)
    onSignedIn()
  }

  const views: Record<SignInOrUpState, ReactNode> = {
    email: <Email onSubmitEmail={onSubmitEmail} />,
    password: <Password onSubmitPassword={onSubmitPassword} />,
    confirmPassword: (
      <ConfirmPassword onSubmitConfirmedPassword={onSubmitConfirmedPassword} />
    ),
  }

  return <>{views[state]}</>
}
