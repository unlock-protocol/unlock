'use client'

import { useSearchParams } from 'next/navigation'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { getPaywallConfigFromQuery } from '~/utils/paywallConfig'
import getOauthConfigFromQuery from '~/utils/oauth'
import { Checkout } from './main'
import { CloseButton } from './Shell'
import { PoweredByUnlock } from './PoweredByUnlock'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { ethers } from 'ethers'
import { PaywallConfigType } from '@unlock-protocol/core'
import { Connect } from './Connect'
import { isInIframe } from '~/utils/iframe'
import { useEffect } from 'react'
import { config } from '~/config/app'
import { postToWebhook } from './main/checkoutHookUtils'
import { useAuthenticate } from '~/hooks/useAuthenticate'

declare const window: any
export function CheckoutContainer() {
  const searchParams = useSearchParams()
  const { account } = useAuthenticate()

  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()
  const { isLoading, data: checkout } = useCheckoutConfig({
    id: searchParams.get('id')?.toString(),
  })

  const referrerAddress = searchParams.get('referrerAddress')?.toString()
  // Get paywallConfig or oauthConfig from the query parameters.
  const paywallConfigFromQuery = getPaywallConfigFromQuery(searchParams)
  const oauthConfigFromQuery = getOauthConfigFromQuery(searchParams)

  const oauthConfig = communication.oauthConfig || oauthConfigFromQuery
  const paywallConfig =
    (checkout?.config as PaywallConfigType) ||
    communication.paywallConfig ||
    paywallConfigFromQuery

  // If the referrer address is valid, override the paywall config referrer with it.
  if (referrerAddress && paywallConfig && ethers.isAddress(referrerAddress)) {
    paywallConfig.referrer = referrerAddress
  }

  const checkoutRedirectURI =
    paywallConfig?.redirectUri ||
    Array.from(searchParams.entries())
      .find(([key]) => {
        return [
          'redirecturi',
          'redirect-uri',
          'redirect-url',
          'redirecturl',
        ].includes(key.toLowerCase())
      })?.[1]
      ?.toString()

  // prevents posting twice when this re-renders
  let prevBody: string
  useEffect(() => {
    let script: any
    let handler: any

    if (paywallConfig && account) {
      handler = window.addEventListener(
        'unlockProtocol.status',
        async (state: any) => {
          const body = state.detail
          if (JSON.stringify(body) === prevBody) {
            return
          } else {
            prevBody = JSON.stringify(body)
            postToWebhook(body, paywallConfig, 'status')
          }
        }
      )

      window.unlockProtocolConfig = paywallConfig

      script = document.createElement('script')
      script.src = `${config.paywallUrl}/static/unlock.latest.min.js`
      script.async = true
      document.body.appendChild(script)
    }

    return () => {
      script?.remove()
      window.removeEventListener('unlockProtocol', handler)
    }
  }, [paywallConfig])

  if (!(paywallConfig || oauthConfig) || isLoading) {
    return <LoadingIcon size={20} className="animate-spin" />
  }

  if (oauthConfig) {
    return <Connect paywallConfig={paywallConfig} oauthConfig={oauthConfig} />
  }

  if (paywallConfig) {
    return (
      <Checkout
        paywallConfig={paywallConfig}
        redirectURI={
          checkoutRedirectURI ? new URL(checkoutRedirectURI) : undefined
        }
        communication={communication}
      />
    )
  }

  return (
    <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
      <div className="flex items-center justify-end mx-4 mt-4">
        <CloseButton
          onClick={() => {
            if (!isInIframe()) {
              window.history.back()
            } else {
              communication.emitCloseModal()
            }
          }}
        />
      </div>
      <main className="p-6">
        <p>
          Please recheck your paywall or sign in with ethereum configuration.
        </p>
      </main>
      <footer>
        <PoweredByUnlock />
      </footer>
    </div>
  )
}
