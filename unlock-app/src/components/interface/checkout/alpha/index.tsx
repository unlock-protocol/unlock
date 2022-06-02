import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import getOauthConfigFromQuery from '~/utils/oauth'
import { useConfig } from '~/utils/withConfig'
import { Connect } from './Connect'
import { Container } from './Container'

export function CheckoutPage() {
  const { query } = useRouter()
  const config = useConfig()
  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()

  const oauthConfig = getOauthConfigFromQuery(query)

  const injectedProvider =
    communication.providerAdapter || selectProvider(config)

  useEffect(() => {
    document.body.querySelector('body')?.classList.add('bg-transparent')
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

  return <Container>Error</Container>
}
