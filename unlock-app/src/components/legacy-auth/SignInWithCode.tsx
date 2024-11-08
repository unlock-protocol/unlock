import { useState } from 'react'
import { locksmith } from '~/config/locksmith'
import { useCaptcha } from '~/hooks/useCaptcha'
import { EnterCode } from '../interface/connect/EnterCode'
import { ToastHelper } from '../helpers/toast.helper'
import {
  InitializeWaas,
  PrivateKeyFormat,
  RawPrivateKey,
} from '@coinbase/waas-sdk-web'
import { config } from '~/config/app'
import { getUserWaasUuid } from '~/utils/getUserWaasUuid'
import { UserAccountType } from '~/utils/userAccountType'
import { Button } from '@unlock-protocol/ui'
import { getSession } from 'next-auth/react'
import ReCAPTCHA from 'react-google-recaptcha'

// TODO: finish testing this works in a "real" environment (can't test with existing accounts on a different domain)
export const getPrivateKeyFromWaas = async (
  captcha: string,
  accountType: UserAccountType
) => {
  const waas = await InitializeWaas({
    collectAndReportMetrics: true,
    enableHostedBackups: true,
    prod: config.env === 'prod',
    projectId: config.coinbaseProjectId,
  })

  const user = await waas.auth.login({
    provideAuthToken: async () => {
      const nextAuthSession = await getSession()
      const waasToken = await getUserWaasUuid(
        captcha,
        nextAuthSession?.user?.email as string,
        accountType,
        nextAuthSession?.user?.token as string
      )
      return waasToken!
    },
  })

  console.log('user from waas', user)

  let wallet

  if (waas.wallets.wallet) {
    // Resuming wallet
    wallet = waas.wallets.wallet
  } else if (user.hasWallet) {
    // Restoring wallet
    console.log('restoring wallet')
    wallet = await waas.wallets.restoreFromHostedBackup()
    console.log('wallet from waas', wallet)
  } else {
    console.log('creating a waas wallet (for debugging only!)', wallet)
    // Creating wallet
    wallet = await waas.wallets.create()
  }

  if (!wallet) {
    console.error('No wallet linked to that user. It cannot be migrated.')
    return
  }

  const exportedKeys = await wallet.exportKeysFromHostedBackup(
    undefined,
    'RAW' as PrivateKeyFormat
  )
  // use the first key's private key (ecKeyPrivate)
  if (exportedKeys.length > 0) {
    const firstKey = exportedKeys[0] as RawPrivateKey
    return firstKey.ecKeyPrivate
  } else {
    console.error('No private keys found in wallet, so it cannot be migrated.')
  }
}

export const SignInWithCode = ({
  email,
  onNext,
}: {
  email: string
  onNext: (pkey: string) => void
}) => {
  const [codeSent, setCodeSent] = useState(false)
  const { getCaptchaValue, recaptchaRef } = useCaptcha()

  const sendEmailCode = async () => {
    try {
      const captcha = await getCaptchaValue()
      await locksmith.sendVerificationCode(captcha, email)
      ToastHelper.success('Email code sent!')
      setCodeSent(true)
    } catch (error) {
      console.error(error)
      ToastHelper.error('Error sending email code, try again later')
    }
  }

  const onCodeCorrect = async () => {
    const privateKey = await getPrivateKeyFromWaas(
      await getCaptchaValue(),
      UserAccountType.EmailCodeAccount
    )
    if (privateKey) {
      onNext(privateKey)
    } else {
      ToastHelper.error('Error getting private key from WAAS')
    }
  }

  return (
    <>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      {!codeSent && (
        <div className="flex flex-col gap-4">
          <p>
            Please, verify that you own this email address by entering the code
            you will receive by email.
          </p>
          <Button onClick={sendEmailCode}>Send code</Button>
        </div>
      )}
      {codeSent && (
        <EnterCode
          // Not sure this is useful
          callbackUrl={'/migrate-user'}
          onReturn={onCodeCorrect}
          email={email}
        />
      )}
    </>
  )
}
