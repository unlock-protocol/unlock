import { Button, Input } from '@unlock-protocol/ui'
import useAccount from '~/hooks/useAccount'
import { useConfig } from '~/utils/withConfig'
import UnlockProvider from '~/services/unlockProvider'
import { useForm } from 'react-hook-form'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useAuth } from '~/contexts/AuthenticationContext'
import BlockiesSvg from 'blockies-react-svg'
import { UserAccountType } from '~/utils/userAccountType'
import { signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ConnectButton } from './Custom'
import SvgComponents from '../svg'

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

const SignInUnlockAccount = ({
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
  shouldRedirect: boolean
  onReturn(): void
}

const SignUp = ({ shouldRedirect, onReturn }: SignUpProps) => {
  const router = useRouter()
  const state = JSON.stringify({
    redirectUrl: shouldRedirect ? router.asPath : undefined,
  })

  let redirectUrl

  if (shouldRedirect) {
    redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}/connecting`
        : ''
  } else {
    redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}${router.asPath}`
        : ''
  }

  console.log('redirectUrl', redirectUrl)

  const callbackUrl = shouldRedirect
    ? `${redirectUrl}/?state=${encodeURIComponent(state)}`
    : redirectUrl
  console.log('callbackUrl', callbackUrl)

  return (
    <div className="grid gap-2">
      <div className="grid gap-4 px-6">
        <ConnectButton
          icon={<SvgComponents.Unlock width={40} height={40} />}
          onClick={() => {
            signIn('google', { callbackUrl: callbackUrl })
          }}
        >
          Sign in with Google
        </ConnectButton>
        <ConnectButton
          icon={<SvgComponents.Unlock width={40} height={40} />}
          onClick={() => {
            signIn('google', { callbackUrl: callbackUrl })
          }}
        >
          Sign in with Google
        </ConnectButton>
        <ConnectButton
          icon={<SvgComponents.Unlock width={40} height={40} />}
          onClick={() => {
            signIn('google', { callbackUrl: callbackUrl })
          }}
        >
          Sign in with Google
        </ConnectButton>
        <div className="w-full flex items-center justify-end px-6 py-4">
          <button
            onClick={() => onReturn()}
            className="hover:text-ui-main-600 underline"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

export interface Props {
  defaultEmail: string
  onExit(): void
  accountType: UserAccountType
  onSignIn?(): void
  useIcon?: boolean
  shouldRedirect: boolean
}

export const ConnectUnlockAccount = ({
  onExit,
  onSignIn,
  accountType,
  useIcon = true,
  defaultEmail,
  shouldRedirect,
}: Props) => {
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
      {accountType.includes(UserAccountType.UnlockAccount) ? (
        <SignInUnlockAccount
          email={defaultEmail}
          signIn={signIn}
          onSignIn={onSignIn}
          useIcon={useIcon}
          onReturn={() => {
            onExit()
          }}
        />
      ) : (
        <SignUp
          shouldRedirect={shouldRedirect}
          onReturn={() => {
            onExit()
          }}
        />
      )}
    </div>
  )
}
