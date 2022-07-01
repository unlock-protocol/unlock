import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { getPaywallConfigFromQuery } from '~/utils/paywallConfig'
import getOauthConfigFromQuery from '~/utils/oauth'
import { useConfig } from '~/utils/withConfig'
import { Checkout } from './Checkout'
import { Connect } from './Connect'
import { Container } from './Container'
import { Shell } from './Shell'
import { PoweredByUnlock } from './PoweredByUnlock'

export function CheckoutPage() {
  const { query } = useRouter()
  const config = useConfig()
  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()

  // Get paywallConfig or oauthConfig from the query parameters.
  const paywallConfigFromQuery = getPaywallConfigFromQuery(query)
  const oauthConfig = getOauthConfigFromQuery(query)

  const injectedProvider =
    communication.providerAdapter || selectProvider(config)

  const paywallConfig = communication.paywallConfig || paywallConfigFromQuery
  const checkoutRedirectURI =
    paywallConfig?.redirectUri || (query.redirectUri as string)

  useEffect(() => {
    document.querySelector('body')?.classList.add('bg-transparent')
  }, [])

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
      <Shell.Root
        onClose={() => {
          console.log(communication)
          if (!communication.insideIframe) {
            window.history.back()
          } else {
            communication.emitCloseModal()
          }
        }}
      >
        <main className="p-6">
          <p>
            Please recheck your paywall or sign in with ethereum configuration.
          </p>
        </main>
        <footer>
          <PoweredByUnlock />
        </footer>
      </Shell.Root>
    </Container>
  )
}
