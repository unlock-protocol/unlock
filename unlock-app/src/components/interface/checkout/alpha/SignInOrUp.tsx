import React, { useState } from 'react'
import { Button, Input } from '@unlock-protocol/ui'
import { FieldValues, useForm } from 'react-hook-form'
import useAccount from '~/hooks/useAccount'
import { useStorageService } from '~/utils/withStorageService'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import UnlockProvider from '~/services/unlockProvider'
import { useConfig } from '~/utils/withConfig'
import { Shell } from './Shell'

interface EmailProps {
  onSubmitEmail(email: string): Promise<void>
}

function Email({ onSubmitEmail }: EmailProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm()

  async function onSubmit({ email }: FieldValues) {
    try {
      await onSubmitEmail(email)
    } catch (error) {
      if (error instanceof Error) {
        setError('email', {
          type: 'value',
          message: error.message,
        })
      }
    }
  }

  return (
    <>
      <header className="px-6">
        <h1 className="font-bold text-lg"> Sign in / up </h1>
        <p> Let&apos;s start with your email address </p>
      </header>
      <Shell.Content>
        <form id="email" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="julien@unlock-protocol.com"
            required
            error={errors?.email?.message}
            description="If you have previously created account with Unlock, please enter the same email to contine"
            {...register('email', {
              required: true,
            })}
          />
        </form>
      </Shell.Content>
      <Shell.Footer>
        <Button type="submit" form="email" className="w-full">
          Next
        </Button>
      </Shell.Footer>
    </>
  )
}

interface UserDetails {
  email: string
  password: string
}

interface SignInProps {
  email: string
  signIn(user: UserDetails): Promise<void> | void
}

function SignIn({ email, signIn }: SignInProps) {
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
      await signIn({
        email,
        password,
      })
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
      <Shell.Content>
        <form id="password" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Password"
            type="password"
            placeholder="password"
            required
            error={errors?.password?.message}
            description={'Enter your password'}
            {...register('password', {
              required: true,
            })}
          />
        </form>
      </Shell.Content>
      <Shell.Footer>
        <Button
          disabled={loading}
          loading={loading}
          type="submit"
          form="password"
          className="w-full"
        >
          {loading ? 'Signing in' : 'Sign in'}
        </Button>
      </Shell.Footer>
    </>
  )
}

interface SignUpProps {
  email: string
  signUp(user: UserDetails): Promise<void> | void
}

function SignUp({ signUp, email }: SignUpProps) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  async function onSubmit({ password, confirmedPassword }: FieldValues) {
    setLoading(true)
    try {
      if (password !== confirmedPassword) {
        throw new Error('Password does not match')
      }
      await signUp({ email, password })
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
        <h1 className="font-bold text-lg"> Sign Up </h1>
        <p>
          Oh hey, you are new in town! Got a strong password in mind? Let&apos;s
          set it up, shall we?
        </p>
      </header>
      <main>
        <form id="confirmPassword" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Password"
            type="password"
            placeholder="password"
            required
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
      </main>
      <Shell.Footer>
        <Button
          loading={loading}
          disabled={loading}
          type="submit"
          form="confirmPassword"
          className="w-full"
        >
          {loading ? 'Creating Account' : 'Create Account'}
        </Button>
      </Shell.Footer>
    </>
  )
}

interface Props {
  onSignedIn(): void
  injectedProvider: unknown
}

type SignInOrUpState = 'email' | 'signIn' | 'signUp'

export function SignInOrUp({ onSignedIn, injectedProvider }: Props) {
  const [state, setState] = useState<SignInOrUpState>('email')
  const [data, setData] = useState({
    email: '',
  })
  const config = useConfig()
  const { retrieveUserAccount, createUserAccount } = useAccount('', 1)
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const storageService = useStorageService()

  const onSubmitEmail = async (email: string) => {
    const existingUser = await storageService.userExist(email)
    setData({
      email,
    })
    if (existingUser) {
      setState('signIn')
    } else {
      setState('signUp')
    }
  }

  const signIn = async ({ email, password }: UserDetails) => {
    const unlockProvider = await retrieveUserAccount(email, password)
    await authenticateWithProvider('UNLOCK', unlockProvider)
    onSignedIn()
  }

  const signUp = async ({ email, password }: UserDetails) => {
    const { passwordEncryptedPrivateKey } = await createUserAccount(
      email,
      password
    )
    const unlockProvider = new UnlockProvider(config.networks[1])
    await unlockProvider.connect({
      key: passwordEncryptedPrivateKey,
      emailAddress: email,
      password,
    })

    await authenticateWithProvider('UNLOCK', unlockProvider)
    onSignedIn()
  }

  function Content() {
    switch (state) {
      case 'email': {
        return <Email onSubmitEmail={onSubmitEmail} />
      }
      case 'signIn': {
        return <SignIn signIn={signIn} email={data.email} />
      }
      case 'signUp': {
        return <SignUp signUp={signUp} email={data.email} />
      }
    }
  }

  return <Content />
}
