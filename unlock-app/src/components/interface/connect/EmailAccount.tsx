import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import useAccount from '~/hooks/useAccount'
import { useForm } from 'react-hook-form'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import BlockiesSvg from 'blockies-react-svg'
import { UserAccountType } from '~/utils/userAccountType'
import { CheckoutService } from '../checkout/main/checkoutMachine'
import { useRouter } from 'next/router'
import { ConnectButton } from './Custom'
import { signIn } from 'next-auth/react'
import { popupCenter } from '~/utils/popup'
import SvgComponents from '../svg'
import { useState } from 'react'
import { EnterCode } from './EnterCode'
import { useSelector } from '@xstate/react'

interface UserDetails {
  email: string
  password: string
}

export type SignUpForm = Record<
  'email' | 'password' | 'confirmPassword',
  string
>

export interface SignInUnlockAccountProps {
  email: string
  signIn: (details: UserDetails) => Promise<unknown> | unknown
  onSignIn?(): void
  useIcon?: boolean
}

const SignInUnlockAccount = ({
  email,
  signIn,
  onSignIn,
  useIcon = true,
}: SignInUnlockAccountProps) => {
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
        await onSignIn()
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
      <form className="grid gap-4 " onSubmit={handleSubmit(onSubmit)}>
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
          label={'Welcome back! '}
          type="password"
          placeholder="Password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          description={`Enter the password for ${email}`}
          error={errors.password?.message}
        />
        <Button type="submit" loading={isSubmitting} className="p-2.5">
          <div className="flex justify-center items-center gap-2">Sign In</div>
        </Button>
      </form>
    </div>
  )
}

export interface SignInProps {
  email: string
  accountType: UserAccountType[]
  onReturn(): void
  signIn: (details: UserDetails) => Promise<unknown> | unknown
  onSignIn?(): void
  useIcon?: boolean
  shoudOpenConnectModal?: boolean
  checkoutService?: CheckoutService
}

const SignIn = ({
  email,
  accountType,
  onReturn,
  signIn,
  onSignIn,
  useIcon = true,
  shoudOpenConnectModal = false,
  checkoutService,
}: SignInProps) => {
  const [isEmailCodeStatus, setEmailCodeStatus] = useState('none')

  const router = useRouter()

  const context = useSelector(checkoutService, (state) => state?.context)

  const url = new URL(
    `${window.location.protocol}//${window.location.host}${router.asPath}`
  )
  const params = new URLSearchParams(url.search)
  params.append(
    'shouldOpenConnectModal',
    encodeURIComponent(shoudOpenConnectModal)
  )
  if (context?.lock) {
    params.set('lock', encodeURIComponent(context.lock.address))
  }
  url.search = params.toString()

  const callbackUrl = url.toString()

  if (isEmailCodeStatus === 'sent') {
    return (
      <EnterCode email={email} callbackUrl={callbackUrl} onReturn={onReturn} />
    )
  } else if (isEmailCodeStatus === 'window') {
    return (
      <div className="px-6">
        <div className="text-sm text-gray-600 mb-4">
          <p>A new window has been opened. Please check there to continue.</p>
        </div>
        <Placeholder.Root className="grid w-full">
          <Placeholder.Line className="w-1/2" />
          <Placeholder.Line className="w-1/2" />
          <Placeholder.Line className="w-1/2" />
        </Placeholder.Root>
      </div>
    )
  }

  return (
    <div className="grid gap-2 px-6">
      <div className="grid gap-4">
        {accountType.length > 0 && (
          <div className="text-sm text-gray-600">Sign in to your account:</div>
        )}
        {accountType.includes(UserAccountType.UnlockAccount) && (
          <SignInUnlockAccount
            email={email}
            signIn={signIn}
            onSignIn={onSignIn}
            useIcon={useIcon}
          />
        )}
        {accountType.includes(UserAccountType.GoogleAccount) && (
          <SignWithGoogle
            callbackUrl={callbackUrl}
            checkoutService={checkoutService}
            isSignUp={false}
          />
        )}
        {accountType.includes(UserAccountType.PasskeyAccount) && (
          <div>Passkey Account</div>
        )}
        {accountType.includes(UserAccountType.EmailCodeAccount) && (
          <SignWithEmail
            isSignUp={false}
            email={email}
            setEmailCodeSent={setEmailCodeStatus}
            callbackUrl={callbackUrl}
          />
        )}
        {accountType.length === 0 && (
          <div className="w-full grid gap-4">
            <div className="text-sm text-gray-600">Create a new account:</div>
            <SignWithGoogle
              callbackUrl={callbackUrl}
              checkoutService={checkoutService}
              isSignUp={true}
            />
            <SignWithEmail
              isSignUp={true}
              email={email}
              setEmailCodeSent={setEmailCodeStatus}
              callbackUrl={callbackUrl}
            />
            {/*}
            <div>Passkey Account</div>
            <div>Email Code Account</div>
            */}
          </div>
        )}
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

export interface SignWithGoogleProps {
  callbackUrl: string
  checkoutService?: CheckoutService
  isSignUp: boolean
}

const SignWithGoogle = ({
  callbackUrl,
  checkoutService,
  isSignUp,
}: SignWithGoogleProps) => {
  const signWithGoogle = () => {
    localStorage.setItem('nextAuthProvider', 'google')

    if (window !== window.parent) {
      popupCenter('/google', 'Google Sign In')
      checkoutService?.send({ type: 'SELECT' })
      return
    }

    signIn('google', { callbackUrl: callbackUrl })
  }

  return (
    <div className="w-full">
      <ConnectButton
        className="w-full"
        icon={<SvgComponents.Google width={40} height={40} />}
        onClick={() => {
          signWithGoogle()
        }}
      >
        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
      </ConnectButton>
    </div>
  )
}

export interface SignWithEmail {
  isSignUp: boolean
  email: string
  setEmailCodeSent: (isEmailCodeSent: string) => void
  callbackUrl: string
}

const SignWithEmail = ({
  isSignUp,
  email,
  setEmailCodeSent,
}: SignWithEmail) => {
  const signWithEmail = () => {
    localStorage.setItem('nextAuthProvider', 'email')

    if (window !== window.parent) {
      popupCenter(`/email?email=${encodeURIComponent(email)}`, 'Google Sign In')
      signIn('email', {
        email: email,
        redirect: false,
      })
      setEmailCodeSent('window')
      return
    }

    signIn('email', {
      email: email,
      redirect: false,
    })

    setEmailCodeSent('sent')
  }

  return (
    <div className="w-full">
      <ConnectButton
        className="w-full"
        icon={<SvgComponents.Email width={40} height={40} />}
        onClick={() => {
          signWithEmail()
        }}
      >
        {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
      </ConnectButton>
    </div>
  )
}

export interface Props {
  email: string
  setEmail: (email: string) => void
  onSignIn?(): void
  useIcon?: boolean
  accountType: UserAccountType[]
  shoudOpenConnectModal: boolean
  checkoutService?: CheckoutService
}

export const ConnectUnlockAccount = ({
  onSignIn,
  useIcon = true,
  email,
  setEmail,
  accountType,
  shoudOpenConnectModal = false,
  checkoutService,
}: Props) => {
  const { retrieveUserAccount } = useAccount('')
  const { authenticateWithProvider } = useAuthenticate()
  const { deAuthenticate } = useAuth()

  const { signOut } = useSIWE()

  const { isUnlockAccount, encryptedPrivateKey } = useAuth()

  const signIn = async ({ email, password }: UserDetails) => {
    const unlockProvider = await retrieveUserAccount(email, password)
    await authenticateWithProvider('UNLOCK', unlockProvider)
  }

  // If isUserAccount and there is a pk, then we are signing the user
  // If isUserAccount and there is no pk, then the user has to retrivi pk from the server
  if (isUnlockAccount && encryptedPrivateKey) {
    return (
      <div className="px-6">
        <Placeholder.Root className="grid w-full">
          <Placeholder.Line className="w-1/2" />
          <Placeholder.Line className="w-1/2" />
          <Placeholder.Line className="w-1/2" />
        </Placeholder.Root>
      </div>
    )
  }

  return (
    <div className="space-y-6 divide-y divide-gray-100">
      <SignIn
        email={email}
        accountType={accountType}
        onReturn={() => {
          signOut()
          deAuthenticate()
          setEmail('')
        }}
        signIn={signIn}
        onSignIn={onSignIn}
        useIcon={useIcon}
        shoudOpenConnectModal={shoudOpenConnectModal}
        checkoutService={checkoutService}
      />
    </div>
  )
}
