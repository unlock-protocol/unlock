import { Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import SvgComponents from '../interface/svg'
import BlockiesSvg from 'blockies-react-svg'
import { UserAccountType } from '~/utils/userAccountType'

import { signIn } from 'next-auth/react'
import { popupCenter } from '~/utils/popup'

import { locksmith } from '~/config/locksmith'
import { useCaptcha } from '~/hooks/useCaptcha'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { config } from '~/config/app'
import ReCaptcha from 'react-google-recaptcha'
import { useState } from 'react'
import { ConnectButton } from '../interface/connect/Custom'
import { EnterCode } from '../interface/connect/EnterCode'

export interface UserDetails {
  email: string
  password: string
}

export interface SignInUnlockAccountProps {
  email: string
  accountType: UserAccountType[]
  onSubmit: (data: UserDetails) => void
  useIcon?: boolean
}

export const SignInUnlockAccount = ({
  email,
  accountType,
  onSubmit,
  useIcon = true,
}: SignInUnlockAccountProps) => {
  const {
    register,
    formState: { errors },
  } = useForm<UserDetails>({
    defaultValues: {
      email,
      password: '',
    },
  })
  const [isEmailCodeSent, setEmailCodeSent] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    onSubmit({ email, password })
  }

  const handleSignIn = async (signInMethod: string, handler: () => void) => {
    localStorage.setItem('nextAuthProvider', signInMethod)

    await handler()
  }

  if (isEmailCodeSent) {
    return (
      <EnterCode
        email={email}
        callbackUrl={'callbackUrl'}
        onReturn={() => {}}
      />
    )
  }

  return (
    <div className="grid gap-2">
      {accountType.includes(UserAccountType.UnlockAccount) && (
        <form className="grid gap-4">
          {useIcon && (
            <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-xl">
              <BlockiesSvg address={'0x'} size={6} className="rounded-full" />
            </div>
          )}
          <Input
            label={''}
            type="password"
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              onChange: handlePasswordChange,
            })}
            description={`Enter the password for ${email}`}
            error={errors.password?.message}
          />
        </form>
      )}
      {accountType.includes(UserAccountType.GoogleAccount) && (
        <SignWithGoogle
          callbackUrl=""
          isSignUp={false}
          handleSignIn={(method, handler) => handler()}
        />
      )}
      {accountType.includes(UserAccountType.PasskeyAccount) && (
        <div>Passkey Account</div>
      )}
      {accountType.includes(UserAccountType.EmailCodeAccount) && (
        <SignWithEmail
          isSignUp={false}
          email={email}
          setEmailCodeSent={setEmailCodeSent}
          callbackUrl=""
          handleSignIn={(method, handler) => handler()}
        />
      )}
    </div>
  )
}

export interface SignWithGoogleProps {
  callbackUrl: string
  isSignUp: boolean
  handleSignIn: (signInMethod: string, handler: () => void) => void
}

const SignWithGoogle = ({
  callbackUrl,
  isSignUp,
  handleSignIn,
}: SignWithGoogleProps) => {
  const signWithGoogle = () => {
    if (window !== window.parent) {
      popupCenter('/google', 'Google Sign In')
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
          handleSignIn(UserAccountType.GoogleAccount, signWithGoogle)
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
  setEmailCodeSent: (isEmailCodeSent: boolean) => void
  callbackUrl: string
  handleSignIn: (signInMethod: string, handler: () => void) => void
}

const SignWithEmail = ({
  isSignUp,
  email,
  setEmailCodeSent,
  handleSignIn,
}: SignWithEmail) => {
  const { recaptchaRef, getCaptchaValue } = useCaptcha()

  const signWithEmail = async () => {
    try {
      const captcha = await getCaptchaValue()
      await locksmith.sendVerificationCode(captcha, email)
    } catch (error) {
      console.error(error)
      ToastHelper.error('Error sending email code, try again later')
    }

    setEmailCodeSent(true)
  }

  return (
    <div className="w-full">
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <ConnectButton
        className="w-full"
        icon={<SvgComponents.Email width={40} height={40} />}
        onClick={async () => {
          await handleSignIn(UserAccountType.EmailCodeAccount, signWithEmail)
        }}
      >
        {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
      </ConnectButton>
    </div>
  )
}
