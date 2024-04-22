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
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import BlockiesSvg from 'blockies-react-svg'

interface UnlockAccountSignInProps {
  onSignUp(): void
  signIn: (details: UserDetails) => Promise<unknown> | unknown
  signOut(): void
  signedInBefore?: boolean
  useIcon: boolean
  onExit(): void
}

export const UnlockAccountSignIn = ({
  onSignUp,
  signIn,
  signOut,
  signedInBefore = false,
  useIcon,
  onExit,
}: UnlockAccountSignInProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<UserDetails>()
  const { email, account } = useAuth()
  const onSubmit = async (data: UserDetails) => {
    if (!data.email && email) {
      data.email = email
    }
    try {
      await signIn(data)
      onExit()
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
        {email ? (
          <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl">
            {useIcon && (
              <BlockiesSvg
                address={account || '0x'}
                size={6}
                className="rounded-full"
              />
            )}
            <div className="text-center">Signed in as {email}</div>
          </div>
        ) : (
          <Input
            label="Email"
            placeholder="your@email.com"
            {...register('email', {
              required: 'Email is required',
              value: email ? email : undefined,
            })}
            error={errors.email?.message}
          />
        )}
        <Input
          label={signedInBefore ? 'Confirm your password' : 'Password'}
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
          {signedInBefore ? 'Confirm' : 'Sign In'}
        </ConnectButton>
      </form>
      {!signedInBefore && (
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
        {(signedInBefore || email) && (
          <ConnectButton
            onClick={(event) => {
              event.preventDefault()
              signOut()
            }}
            icon={<WalletIcon size={24} />}
          >
            Disconnect
          </ConnectButton>
        )}
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
      console.log(error)
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
          label="Email"
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
      <div className="flex items-center justify-end p-6">
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
  useIcon?: boolean
}

export const ConnectUnlockAccount = ({ onExit, useIcon = true }: Props) => {
  const [isSignIn, setIsSignIn] = useState(true)
  const { retrieveUserAccount, createUserAccount } = useAccount('')
  const { authenticateWithProvider } = useAuthenticate()
  const { account, connected, deAuthenticate } = useAuth()
  const config = useConfig()
  const { signOut } = useSIWE()

  const requireSignIn = account && !connected

  const signIn = async ({ email, password }: UserDetails) => {
    const unlockProvider = await retrieveUserAccount(email, password)
    await authenticateWithProvider('UNLOCK', unlockProvider)
  }

  const signUp = async ({ email, password }: UserDetails) => {
    const { passwordEncryptedPrivateKey } = await createUserAccount(
      email,
      password
    )
    if (passwordEncryptedPrivateKey === '') return 'Error creating account'
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
          signOut={() => {
            signOut()
            deAuthenticate()
          }}
          signedInBefore={!!requireSignIn}
          onSignUp={() => {
            setIsSignIn(false)
          }}
          useIcon={useIcon}
          onExit={onExit}
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
    </div>
  )
}
