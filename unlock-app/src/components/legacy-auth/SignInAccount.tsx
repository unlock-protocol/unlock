import { Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import SvgComponents from '../interface/svg'
import BlockiesSvg from 'blockies-react-svg'
import { UserAccountType } from '~/utils/userAccountType'

import { signIn, useSession } from 'next-auth/react'
import { popupCenter } from '~/utils/popup'

import { locksmith } from '~/config/locksmith'
import { useCaptcha } from '~/hooks/useCaptcha'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { config } from '~/config/app'
import ReCaptcha from 'react-google-recaptcha'
import { useEffect, useState } from 'react'
import { ConnectButton } from '../interface/connect/Custom'
import { EnterCode } from '../interface/connect/EnterCode'
import { useLegacyAuth } from '~/contexts/LegacyAuthenticationContext'
import { useLegacySIWE } from '~/hooks/legacy-auth/useLegacySiwe'
import ConnectingWaas from './ConnectingWaas'

export interface UserDetails {
  email: string
  password: string
}

export interface SignInUnlockAccountProps {
  email: string
  accountType: UserAccountType[]
  onSubmit: (data: UserDetails) => void
  useIcon?: boolean
  setWalletPk: (pk: string) => void
}

export const SignInUnlockAccount = ({
  email,
  accountType,
  onSubmit,
  useIcon = true,
  setWalletPk,
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
  const { recaptchaRef, getCaptchaValue } = useCaptcha()
  const { account, connected } = useLegacyAuth()
  const { isSignedIn } = useLegacySIWE()

  const { data: session } = useSession()
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [emailCodeEntered, setEmailCodeEntered] = useState(false)

  const isLoadingWaas =
    session &&
    emailCodeSent &&
    emailCodeEntered &&
    (!connected || !isSignedIn || account === '')

  // automatically trigger email code sending
  useEffect(() => {
    const sendEmailCode = async () => {
      if (accountType.includes(UserAccountType.EmailCodeAccount)) {
        try {
          const captcha = await getCaptchaValue()
          await locksmith.sendVerificationCode(captcha, email)
          setEmailCodeSent(true)
        } catch (error) {
          console.error(error)
          ToastHelper.error('Error sending email code, try again later')
        }
      }
    }
    sendEmailCode()
  }, [accountType, email, getCaptchaValue])

  const handleEmailCodeEntered = () => {
    setEmailCodeEntered(true)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    onSubmit({ email, password })
  }

  if (isLoadingWaas) {
    return <ConnectingWaas setWalletPk={setWalletPk} />
  }

  if (accountType.includes(UserAccountType.EmailCodeAccount)) {
    return (
      <>
        <ReCaptcha
          ref={recaptchaRef}
          sitekey={config.recaptchaKey}
          size="invisible"
          badge="bottomleft"
        />
        <EnterCode
          email={email}
          callbackUrl={'/migrate-user'}
          onReturn={handleEmailCodeEntered}
        />
      </>
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
          handleSignIn={() => {
            ToastHelper.success('Sign in with Google')
          }}
        />
      )}
      {accountType.includes(UserAccountType.PasskeyAccount) && (
        <div>Passkey Account</div>
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
