import { Input } from '@unlock-protocol/ui'
import useAccount from '~/hooks/useAccount'
import { useConfig } from '~/utils/withConfig'
import UnlockProvider from '~/services/unlockProvider'
import { useForm } from 'react-hook-form'
import SvgComponents from '../svg'
import { ConnectButton, CustomAnchorButton } from './Custom'
import { useState } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { IoWalletOutline as WalletIcon } from 'react-icons/io5'

interface UnlockAccountSignInProps {
  onSignUp(): void
  signIn: (details: UserDetails) => Promise<unknown> | unknown
}

export const UnlockAccountSignIn = ({
  onSignUp,
  signIn,
}: UnlockAccountSignInProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<UserDetails>()
  const onSubmit = async (data: UserDetails) => {
    try {
      await signIn(data)
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
        <Input
          label="email"
          placeholder="your@email.com"
          {...register('email', {
            required: 'Email is required',
          })}
          error={errors.email?.message}
        />
        <Input
          label="Password"
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
        <ConnectButton
          primary
          loading={isSubmitting}
          icon={
            <SvgComponents.Unlock
              width={40}
              height={40}
              className="fill-inherit"
            />
          }
        >
          Sign in
        </ConnectButton>
      </form>
      <div className="flex items-center justify-end px-6">
        <button
          onClick={(event) => {
            event.preventDefault()
            onSignUp()
          }}
          className="hover:text-ui-main-600"
        >
          No account?
        </button>
      </div>
    </div>
  )
}
interface UnlockAccountSignUpProps {
  onSignIn(): void
  signUp: (details: UserDetails) => Promise<unknown> | unknown
}

interface UserDetails {
  email: string
  password: string
}

export type SignUpForm = Record<
  'email' | 'password' | 'confirmPassword',
  string
>
export const UnlockAccountSignUp = ({
  onSignIn,
  signUp,
}: UnlockAccountSignUpProps) => {
  const {
    register,
    getValues,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>()

  const onSubmit = async ({ email, password }: SignUpForm) => {
    try {
      await signUp({ email, password })
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
          type="email"
          label="email"
          placeholder="your@email.com"
          {...register('email', {
            required: {
              value: true,
              message: 'Email is required',
            },
          })}
          error={errors.email?.message}
        />
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
        <ConnectButton
          type="submit"
          primary
          loading={isSubmitting}
          icon={
            <SvgComponents.Unlock
              width={40}
              height={40}
              className="fill-inherit"
            />
          }
        >
          Create an account
        </ConnectButton>
      </form>
      <div className="flex items-center justify-end px-6">
        <button
          onClick={(event) => {
            event.preventDefault()
            onSignIn()
          }}
          className="hover:text-ui-main-600"
        >
          Have an account?
        </button>
      </div>
    </div>
  )
}

export interface Props {
  onExit(): void
}

export const ConnectUnlockAccount = ({ onExit }: Props) => {
  const [isSignIn, setIsSignIn] = useState(true)
  const { retrieveUserAccount, createUserAccount } = useAccount('')
  const { authenticateWithProvider } = useAuthenticate()
  const config = useConfig()

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

  return (
    <div className="space-y-6 divide-y divide-gray-100">
      {isSignIn && (
        <UnlockAccountSignIn
          signIn={signIn}
          onSignUp={() => {
            setIsSignIn(false)
          }}
        />
      )}
      {!isSignIn && (
        <UnlockAccountSignUp
          signUp={signUp}
          onSignIn={() => {
            setIsSignIn(true)
          }}
        />
      )}
      <div className="grid gap-4 p-6">
        <CustomAnchorButton
          target="_blank"
          rel="noopener noreferrer"
          href="https://ethereum.org/en/wallets/find-wallet/"
        >
          Get a crypto wallet
        </CustomAnchorButton>
        <ConnectButton
          icon={<WalletIcon size={24} />}
          onClick={(event) => {
            event.preventDefault()
            onExit()
          }}
        >
          <span>Back to using your crypto wallet</span>
        </ConnectButton>
      </div>
    </div>
  )
}
