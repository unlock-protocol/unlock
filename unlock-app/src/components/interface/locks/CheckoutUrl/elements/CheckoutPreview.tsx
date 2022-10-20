import { Button } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/alpha/Checkout'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PaywallConfig } from '~/unlockTypes'
import { useConfig } from '~/utils/withConfig'

interface CheckoutPreviewProps {
  paywallConfig?: PaywallConfig
}

export const CheckoutPreview = ({ paywallConfig }: CheckoutPreviewProps) => {
  const config = useConfig()
  // Fetch config from parent in iframe context
  const communication = useCheckoutCommunication()

  const injectedProvider =
    communication.providerAdapter || selectProvider(config)

  const checkoutRedirectURI = ''

  const hasLocks = Object.entries(paywallConfig?.locks ?? {})?.length > 0
  return (
    <div className="flex items-center justify-center w-full py-10 bg-gray-300 rounded-xl">
      <div className="flex items-center justify-center w-full max-w-lg">
        {paywallConfig ? (
          <div className="flex flex-col items-center w-full gap-4">
            <Checkout
              injectedProvider={injectedProvider as any}
              communication={communication}
              paywallConfig={paywallConfig as any}
              redirectURI={
                checkoutRedirectURI ? new URL(checkoutRedirectURI) : undefined
              }
            />
            {hasLocks && (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  This checkout modal is ready for you to use.
                </span>
                <Button size="small">Copy URL</Button>
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm">preview</span>
        )}
      </div>
    </div>
  )
}
