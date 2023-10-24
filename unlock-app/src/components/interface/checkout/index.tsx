import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { selectProvider, useAuthenticate } from '~/hooks/useAuthenticate'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { getPaywallConfigFromQuery } from '~/utils/paywallConfig'
import getOauthConfigFromQuery from '~/utils/oauth'
import { useConfig } from '~/utils/withConfig'
import { Checkout } from './main'
import { Connect } from './Connect'
import { Container } from './Container'
import { CloseButton } from './Shell'
import { PoweredByUnlock } from './PoweredByUnlock'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'
import { ethers } from 'ethers'
import { PaywallConfigType } from '@unlock-protocol/core'

export function CheckoutPage() {
  const { query } = useRouter()
  const config = useConfig()
  const { authenticateWithProvider } = useAuthenticate({})

  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()
  const { isInitialLoading, data: checkout } = useCheckoutConfig({
    id: query.id?.toString(),
  })

  const referrerAddress = query?.referrerAddress?.toString()
  // Get paywallConfig or oauthConfig from the query parameters.
  const paywallConfigFromQuery = getPaywallConfigFromQuery(query)
  const oauthConfigFromQuery = getOauthConfigFromQuery(query)

  const oauthConfig = communication.oauthConfig || oauthConfigFromQuery
  const paywallConfig =
    (checkout?.config as PaywallConfigType) ||
    communication.paywallConfig ||
    paywallConfigFromQuery

  // If the referrer address is valid, override the paywall config referrer with it.
  if (
    referrerAddress &&
    paywallConfig &&
    ethers.utils.isAddress(referrerAddress)
  ) {
    paywallConfig.referrer = referrerAddress
  }

  // Autoconnect, provider might change (we could receive the provider from the parent with a delay!)
  useEffect(() => {
    if (communication.providerAdapter) {
      authenticateWithProvider(
        'DELEGATED_PROVIDER',
        communication.providerAdapter
      )
    }
  }, [authenticateWithProvider, communication.providerAdapter])

  // TODO: do we need to pass it down?
  const injectedProvider =
    communication.providerAdapter || selectProvider(config)

  const checkoutRedirectURI =
    paywallConfig?.redirectUri ||
    Object.entries(query)
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

  if (!(paywallConfig || oauthConfig) || isInitialLoading) {
    return (
      <Container>
        <LoadingIcon size={20} className="animate-spin" />
      </Container>
    )
  }

  if (oauthConfig) {
    return (
      <Container>
        <Connect
          injectedProvider={injectedProvider}
          communication={communication}
          oauthConfig={oauthConfig}
        />
      </Container>
    )
  }
  if (paywallConfig) {
    return (
      <Container>
        <Checkout
          injectedProvider={injectedProvider}
          communication={communication}
          paywallConfig={paywallConfig}
          redirectURI={
            checkoutRedirectURI ? new URL(checkoutRedirectURI) : undefined
          }
        />
      </Container>
    )
  }
  return (
    <Container>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
        <div className="flex items-center justify-end mx-4 mt-4">
          <CloseButton
            onClick={() => {
              if (!communication.insideIframe) {
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
