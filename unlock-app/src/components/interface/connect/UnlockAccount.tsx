import { Button, Input } from '@unlock-protocol/ui'
import useAccount from '~/hooks/useAccount'
import { useConfig } from '~/utils/withConfig'
import UnlockProvider from '~/services/unlockProvider'
import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import BlockiesSvg from 'blockies-react-svg'
import { useStorageService } from '~/utils/withStorageService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useRouter } from 'next/router'
import { NextAuthAccount } from './NextAuthAccount'

interface UserDetails {
  email: string
  password: string
}

export type SignUpForm = Record<
  'email' | 'password' | 'confirmPassword',
  string
>

export interface SignInProps {
  email: string
  onReturn(): void
  signIn: (details: UserDetails) => Promise<unknown> | unknown
  onSignIn?(): void
  useIcon?: boolean
}

const SignIn = ({
  email,
  onReturn,
  signIn,
  onSignIn,
  useIcon = true,
}: SignInProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<UserDetails>()

  const { account } = useAuth()

  const onSubmit = async (data: UserDetails) => {
    if (!data.email && email) {
      data.email = email
    }
    try {
      await signIn(data)
      if (onSignIn) {
        onSignIn()
      }
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
  }
  return (
    <div className="grid gap-2">
      <form className="grid gap-4 px-6" onSubmit={handleSubmit(onSubmit)}>
        {useIcon && (
          <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl">
            <BlockiesSvg
              address={account || '0x'}
              size={6}
              className="rounded-full"
            />
          </div>
        )}
        <Input
          label={'Password'}
          type="password"
          placeholder="Password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          error={errors.password?.message}
        />
        <Button type="submit" loading={isSubmitting} className="p-2.5">
          <div className="flex justify-center items-center gap-2">Sign In</div>
        </Button>
      </form>
      <div className="flex items-center justify-end px-6 py-4">
        <button
          onClick={(event) => {
            event.preventDefault()
            onReturn()
          }}
          className="hover:text-ui-main-600 underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export interface SignUpProps {
  email: string
  onReturn(): void
  signUp: (details: UserDetails) => Promise<unknown> | unknown
  onSignIn?(): void
}

const SignUp = ({ email, onReturn, signUp, onSignIn }: SignUpProps) => {
  const {
    register,
    getValues,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>()

  const onSubmit = async ({ password }: SignUpForm) => {
    try {
      await signUp({ email, password })
      if (onSignIn) {
        onSignIn()
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(
          'confirmPassword',
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
  }
  return (
    <div className="grid gap-2">
      <form className="grid gap-4 px-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Password"
          type="password"
          placeholder="Password"
          {...register('password', {
            required: {
              value: true,
              message: 'Password is required',
            },
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          error={errors.password?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-type your password"
          {...register('confirmPassword', {
            required: {
              value: true,
              message: 'Password confirmation is required',
            },
            validate: (value) => {
              if (value !== getValues('password')) {
                return 'Passwords do not match'
              }
              return true
            },
          })}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" loading={isSubmitting} className="p-2.5">
          <div className="flex justify-center items-center gap-2">
            Create an account
          </div>
        </Button>
      </form>
      <div className="flex items-center justify-end px-6">
        <button
          onClick={(event) => {
            event.preventDefault()
            onReturn()
          }}
          className="hover:text-ui-main-600 underline"
        >
          Back
        </button>
      </div>
    </div>
  )
}

export interface Props {
  defaultEmail?: string
  onExit(): void
  onSignIn?(): void
  useIcon?: boolean
}

export const ConnectUnlockAccount = ({
  onExit,
  onSignIn,
  useIcon = true,
  defaultEmail = '',
}: Props) => {
  const [isValidEmail, setIsValidEmail] = useState(false)

  const router = useRouter()
  const nexthAuthValue = router.query.nextAuth as string
  console.log('NextAuth', nexthAuthValue)
  const useNextAuth = nexthAuthValue === 'true'

  const { retrieveUserAccount, createUserAccount } = useAccount('')
  const { authenticateWithProvider } = useAuthenticate()
  const { email, deAuthenticate } = useAuth()
  // TODO: Consider adding a way to set the email address to Auth context
  const [authEmail, setAuthEmail] = useState(email)
  const config = useConfig()
  const { signOut } = useSIWE()
  const storageService = useStorageService()

  const signIn = async ({ email, password }: UserDetails) => {
    const unlockProvider = await retrieveUserAccount(email, password)
    await authenticateWithProvider('UNLOCK', unlockProvider)
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
  }

  const onEmail = useCallback(
    async ({ email }: { email: string }) => {
      try {
        const existingUser = await storageService.userExist(email)
        setIsValidEmail(existingUser)
      } catch (error) {
        if (error instanceof Error) {
          ToastHelper.error(`Email Error: ${error.message}`)
        }
      }
    },
    [storageService]
  )

  useEffect(() => {
    onEmail({ email: defaultEmail })
  }, [defaultEmail, onEmail])

  return (
    <div className="space-y-6 divide-y divide-gray-100">
      {authEmail ? (
        <SignIn
          email={authEmail}
          signIn={signIn}
          onSignIn={onSignIn}
          useIcon={useIcon}
          onReturn={() => {
            signOut()
            deAuthenticate()
            setAuthEmail('')
          }}
        />
      ) : (
        <>
          {isValidEmail && (
            <SignIn
              email={defaultEmail}
              signIn={signIn}
              onSignIn={onSignIn}
              useIcon={useIcon}
              onReturn={() => {
                onExit()
                setIsValidEmail(false)
              }}
            />
          )}
          {!isValidEmail && (
            <SignUp
              email={defaultEmail}
              signUp={signUp}
              onSignIn={onSignIn}
              onReturn={() => {
                onExit()
                setIsValidEmail(false)
              }}
            />
          )}
          {useNextAuth && <NextAuthAccount />}
        </>
      )}
    </div>
  )
}
