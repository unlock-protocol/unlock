import { Placeholder } from '@unlock-protocol/ui'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { config } from '~/config/app'
import { ToastHelper } from '~/components/helpers/toast.helper'
import SvgComponents from '../interface/svg'
import { useCaptcha } from '~/hooks/useCaptcha'
import ReCaptcha from 'react-google-recaptcha'
import { UserAccountType } from '~/utils/userAccountType'
import { PrivateKeyFormat, RawPrivateKey, Wallet } from '@coinbase/waas-sdk-web'
import { InitializeWaas } from '@coinbase/waas-sdk-web'
import { getUserWaasUuid } from '~/utils/getUserWaasUuid'

interface ConnectingWaasProps {
  setWalletPk: (pk: string) => void
}

export const ConnectingWaas = ({ setWalletPk }: ConnectingWaasProps) => {
  const { data: session } = useSession()

  const [selectedProvider, _] = useState<UserAccountType>(
    localStorage.getItem('nextAuthProvider') as UserAccountType
  )

  const { recaptchaRef, getCaptchaValue } = useCaptcha()

  const connect = async () => {
    try {
      const waas = await InitializeWaas({
        collectAndReportMetrics: true,
        enableHostedBackups: true,
        prod: config.env === 'prod',
        projectId: config.coinbaseProjectId,
      })

      const user = await waas.auth.login({
        provideAuthToken: async () => {
          const waasToken = await getUserWaasUuid(
            'sdhddudd',
            session?.user?.email as string,
            UserAccountType.EmailCodeAccount,
            session?.user?.token as string
          )

          console.log('waas token', waasToken)
          return waasToken!
        },
      })

      console.log('user from waas', user)

      let wallet: Wallet

      console.log('waas wallets', waas.wallets)
      if (waas.wallets.wallet) {
        // Resuming wallet
        wallet = waas.wallets.wallet
      } else if (user.hasWallet) {
        // Restoring wallet
        console.log('restoring wallet')
        wallet = await waas.wallets.restoreFromHostedBackup()
        console.log('wallet from waas', wallet)
      } else {
        // Creating wallet
        console.log('creating wallet')
        wallet = await waas.wallets.create()
        console.log('wallet from waas', wallet)
      }

      const exportedKeys = await wallet.exportKeysFromHostedBackup(
        undefined,
        'RAW' as PrivateKeyFormat
      )
      // use the first key's private key (ecKeyPrivate)
      if (exportedKeys.length > 0) {
        const firstKey = exportedKeys[0] as RawPrivateKey
        setWalletPk(firstKey.ecKeyPrivate)
      } else {
        throw new Error('No private keys found in wallet')
      }
    } catch (error) {
      ToastHelper.error(
        'We could not connect your account to your wallet. Please refresh and try again.'
      )
      console.error('Error connecting to provider: ', error)
      throw new Error('Error connecting to provider')
    }
  }

  useEffect(() => {
    if (!session || !selectedProvider) return

    connect()
  }, [selectedProvider])

  return (
    <div className="h-full px-6 pb-6">
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <div className="grid">
        <div className="flex flex-col items-center justify-center gap-6 pb-6">
          {selectedProvider == UserAccountType.GoogleAccount && (
            <SvgComponents.Google width={40} height={40} />
          )}
          {selectedProvider == UserAccountType.EmailCodeAccount && (
            <SvgComponents.Email width={40} height={40} />
          )}
          <div className="inline-flex items-center gap-2 text-lg font-bold">
            {session && session.user?.email}
          </div>
        </div>
        <span className="flex w-full max-w-lg text-base text-gray-700 justify-center">
          Signing in...
        </span>
        <div>
          <Placeholder.Root className="mt-4">
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Root>
        </div>
        <div className="w-full flex items-center justify-end px-6 py-4">
          <button
            onClick={() => {
              console.log('Sign out prevented')
            }}
            className="hover:text-ui-main-600 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectingWaas
