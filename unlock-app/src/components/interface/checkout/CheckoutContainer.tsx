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
import { useQuery } from '@tanstack/react-query'
import { resolvePaywallConfigReferrers } from '~/utils/checkoutReferrers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { config as AppConfig } from '~/config/app'

export function CheckoutContainer() {
  const searchParams = useSearchParams()

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
  const configuredPaywallConfig =
    (checkout?.config as PaywallConfigType) ||
    communication.paywallConfig ||
    paywallConfigFromQuery

  const paywallConfig =
    referrerAddress &&
    configuredPaywallConfig &&
    ethers.isAddress(referrerAddress)
      ? {
          ...configuredPaywallConfig,
          referrer: referrerAddress,
        }
      : configuredPaywallConfig

  const { data: resolvedPaywallConfig, isLoading: isResolvingReferrers } =
    useQuery({
      queryKey: ['resolvePaywallConfigReferrers', paywallConfig],
      queryFn: async () =>
        resolvePaywallConfigReferrers(
          paywallConfig!,
          new Web3Service(AppConfig.networks)
        ),
      enabled: !!paywallConfig,
      staleTime: Infinity,
    })

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

  if (
    !(resolvedPaywallConfig || oauthConfig) ||
    isLoading ||
    isResolvingReferrers
  ) {
    return <LoadingIcon size={20} className="animate-spin" />
  }

  if (oauthConfig) {
    return (
      <Connect
        paywallConfig={resolvedPaywallConfig}
        oauthConfig={oauthConfig}
      />
    )
  }

  if (resolvedPaywallConfig) {
    return (
      <Checkout
        paywallConfig={resolvedPaywallConfig}
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
