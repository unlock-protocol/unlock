'use client'

import { useSearchParams } from 'next/navigation'
import { createContext, useEffect, useState } from 'react'
import {
  AsyncSendable,
  useCheckoutCommunication,
} from '~/hooks/useCheckoutCommunication'
import { getPaywallConfigFromQuery } from '~/utils/paywallConfig'
import getOauthConfigFromQuery from '~/utils/oauth'
import { Checkout } from './main'
import { Container } from './Container'
import { CloseButton } from './Shell'
import { PoweredByUnlock } from './PoweredByUnlock'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { ethers } from 'ethers'
import { PaywallConfigType } from '@unlock-protocol/core'
import { Connect } from './Connect'
import { isInIframe } from '~/utils/iframe'

export const ProviderAdpaterContext = createContext<{
  providerAdapter?: AsyncSendable | null
  setProviderAdapter: (provider: AsyncSendable) => void
}>({
  providerAdapter: null,
  setProviderAdapter: () => {
    console.error('setProviderAdapter is not ready')
  },
})

export function CheckoutPage() {
  const searchParams = useSearchParams()

  const [providerAdapter, setProviderAdapter] = useState<AsyncSendable | null>(
    null
  )

  console.log('READY!')
  console.log({ providerAdapter })

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

  useEffect(() => {
    document.querySelector('body')?.classList.add('bg-transparent')
  }, [])

  if (!(paywallConfig || oauthConfig) || isLoading) {
    return (
      <Container>
        <LoadingIcon size={20} className="animate-spin" />
      </Container>
    )
  }

  if (oauthConfig) {
    return (
      <Container>
        <Connect paywallConfig={paywallConfig} oauthConfig={oauthConfig} />
      </Container>
    )
  }
  if (paywallConfig) {
    return (
      <Container>
        <ProviderAdpaterContext.Provider
          value={{
            providerAdapter,
            setProviderAdapter: (provider: AsyncSendable) => {
              console.log('Setting providerAdapter')
              setProviderAdapter(provider)
            },
          }}
        >
          <Checkout
            paywallConfig={paywallConfig}
            redirectURI={
              checkoutRedirectURI ? new URL(checkoutRedirectURI) : undefined
            }
            communication={communication}
          />
        </ProviderAdpaterContext.Provider>
      </Container>
    )
  }
  return (
    <Container>
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
    </Container>
  )
}
