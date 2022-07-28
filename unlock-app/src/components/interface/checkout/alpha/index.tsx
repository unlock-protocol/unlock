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
import { CloseButton } from './Shell'
import { PoweredByUnlock } from './PoweredByUnlock'
import { CgSpinner as LoadingIcon } from 'react-icons/cg'

export function CheckoutPage() {
  const { query, pathname } = useRouter()
  const config = useConfig()
  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()

  // Get paywallConfig or oauthConfig from the query parameters.
  const paywallConfigFromQuery = getPaywallConfigFromQuery(query)
  const oauthConfig = getOauthConfigFromQuery(query)

  const paywallConfig = communication.paywallConfig || paywallConfigFromQuery

  const injectedProvider =
    communication.providerAdapter || selectProvider(config)

  const checkoutRedirectURI =
    paywallConfig?.redirectUri || (query.redirectUri as string)

  useEffect(() => {
    document.querySelector('body')?.classList.add('bg-transparent')
  }, [])

  if (!(paywallConfig || oauthConfig)) {
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
        <div className="flex items-center justify-end mt-4 mx-4">
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
