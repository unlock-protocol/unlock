import { useState } from 'react'
import { locksmith } from '~/config/locksmith'
import { useCaptcha } from '~/hooks/useCaptcha'
import { EnterCode } from '../interface/connect/EnterCode'
import { ToastHelper } from '../helpers/toast.helper'
import {
  InitializeWaas,
  PrivateKeyFormat,
  RawPrivateKey,
  Waas,
} from '@coinbase/waas-sdk-web'
import { config } from '~/config/app'
import { getUserWaasUuid } from '~/utils/getUserWaasUuid'
import { UserAccountType } from '~/utils/userAccountType'
import { Button } from '@unlock-protocol/ui'
import { getSession } from 'next-auth/react'
import ReCAPTCHA from 'react-google-recaptcha'

// Singleton instance for WAAS
let waasInstance: Waas | null = null

/**
 * Initialize and return the WAAS instance.
 * Ensures that WAAS is initialized only once (Singleton Pattern).
 */
const getWaasInstance = async (): Promise<Waas> => {
  if (waasInstance) {
    return waasInstance
  }

  waasInstance = await InitializeWaas({
    collectAndReportMetrics: true,
    enableHostedBackups: true,
    prod: config.env === 'prod',
    projectId: config.coinbaseProjectId,
  })

  return waasInstance
}

// TODO: finish testing this works in a "real" environment (can't test with existing accounts on a different domain)
/**
 * Retrieves the private key from WAAS.
 * @param captcha - The CAPTCHA value.
 * @param accountType - The type of user account.
 * @returns The private key string or null if not found.
 */
export const getPrivateKeyFromWaas = async (
  captcha: string,
  accountType: UserAccountType
): Promise<string | null> => {
  try {
    const waas = await getWaasInstance()

    const user = await waas.auth.login({
      provideAuthToken: async () => {
        const nextAuthSession = await getSession()
        if (
          !nextAuthSession ||
          !nextAuthSession.user ||
          !nextAuthSession.user.email ||
          !nextAuthSession.user.token
        ) {
          throw new Error('Invalid session data')
        }

        const waasToken = await getUserWaasUuid(
          captcha,
          nextAuthSession.user.email,
          accountType,
          nextAuthSession.user.token
        )

        if (!waasToken) {
          throw new Error('Failed to retrieve WAAS token')
        }

        return waasToken
      },
    })

    // Conditionally log based on environment
    if (config.env !== 'prod') {
      console.log('user from waas', user)
    }

    let wallet: any = null

    if (waas.wallets.wallet) {
      // Resuming wallet
      wallet = waas.wallets.wallet
    } else if (user.hasWallet) {
      // Restoring wallet
      if (config.env !== 'prod') {
        console.log('restoring wallet')
      }
      wallet = await waas.wallets.restoreFromHostedBackup()

      if (config.env !== 'prod') {
        console.log('wallet from waas', wallet)
      }
    } else {
      if (config.env !== 'prod') {
        console.log('creating a waas wallet (for debugging only!)')
      }
      // Creating wallet
      wallet = await waas.wallets.create()
    }

    if (!wallet) {
      console.error('No wallet linked to that user. It cannot be migrated.')
      return null
    }

    const exportedKeys = await wallet.exportKeysFromHostedBackup(
      undefined,
      PrivateKeyFormat.RAW
    )

    if (config.env !== 'prod') {
      console.log('exportedKeys', exportedKeys)
    }

    // Use the first key's private key (ecKeyPrivate)
    if (exportedKeys.length > 0) {
      const firstKey = exportedKeys[0] as RawPrivateKey
      return firstKey.ecKeyPrivate
    } else {
      console.error(
        'No private keys found in wallet, so it cannot be migrated.'
      )
      return null
    }
  } catch (error) {
    console.error('Error in getPrivateKeyFromWaas:', error)
    return null
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
      if (!captcha) {
        ToastHelper.error('CAPTCHA verification failed')
        return
      }
      await locksmith.sendVerificationCode(captcha, email)
      ToastHelper.success('Email code sent!')
      setCodeSent(true)
    } catch (error) {
      console.error('Error sending email code:', error)
      ToastHelper.error('Error sending email code, try again later')
    }
  }

  const onCodeCorrect = async () => {
    try {
      const captcha = await getCaptchaValue()
      if (!captcha) {
        ToastHelper.error('CAPTCHA verification failed')
        return
      }
      const privateKey = await getPrivateKeyFromWaas(
        captcha,
        UserAccountType.EmailCodeAccount
      )
      if (privateKey) {
        onNext(privateKey)
      } else {
        ToastHelper.error('Error getting private key from WAAS')
      }
    } catch (error) {
      console.error('Error in onCodeCorrect:', error)
      ToastHelper.error('Error processing the code')
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
