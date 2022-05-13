import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import getPaywallConfigFromQuery from '~/utils/getConfigFromSearch'
import getOauthConfigFromQuery from '~/utils/oauth'
import { Checkout } from './Checkout'
import { Connect } from './Connect'
import { Container } from './Container'

export function CheckoutPage() {
  const { query } = useRouter()
  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()

  // Get paywallConfig or oauthConfig from the query parameters.
  const paywallConfigFromQuery = getPaywallConfigFromQuery(query)
  const oauthConfig = getOauthConfigFromQuery(query)

  const paywallConfig = communication.paywallConfig || paywallConfigFromQuery

  useEffect(() => {
    document.body.querySelector('body')?.classList.add('bg-transparent')
  }, [])

  if (oauthConfig) {
    return (
      <Container>
        <Connect communication={communication} oauthConfig={oauthConfig} />
      </Container>
    )
  }

  if (paywallConfig) {
    return (
      <Container>
        <Checkout
          communication={communication}
          initialStage="select"
          paywallConfig={paywallConfig}
        />
      </Container>
    )
  }

  return <Container>Error</Container>
}
