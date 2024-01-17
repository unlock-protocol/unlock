import { Placeholder } from '@unlock-protocol/ui'
import { LockPriceDetails } from './LockPriceDetails'
import { Card } from '@unlock-protocol/ui'
import { PaywallConfigType } from '@unlock-protocol/core'
import { RegistrationCardSingleLock } from './SingleLock'
import { useValidKeyBulk } from '~/hooks/useKey'
import { HasTicket } from './HasTicket'
import { EmbeddedCheckout } from './EmbeddedCheckout'

export interface RegistrationCardProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const RegistrationCard = ({ checkoutConfig }: RegistrationCardProps) => {
  // Check if the user has a key!
  const queries = useValidKeyBulk(checkoutConfig.config.locks)
  const refresh = () => {
    queries.map((query) => query.refetch())
  }

  const isLoadingValidKeys = queries?.some(
    (query) => query.isInitialLoading || query.isRefetching
  )
  const hasValidKey = queries?.map((query) => query.data).some((value) => value)

  if (isLoadingValidKeys) {
    return <Placeholder.Card size="md" />
  }

  if (hasValidKey) {
    return <HasTicket />
  }

  // We need to behave differently if there is only one lock
  // If there is one single lock
  if (Object.keys(checkoutConfig.config.locks).length == 1) {
    return (
      <Card className="grid gap-6 mt-10 lg:mt-0">
        <div className="grid gap-6 md:gap-8">
          <RegistrationCardSingleLock
            refresh={refresh}
            checkoutConfig={checkoutConfig}
          />
        </div>
      </Card>
    )
  }

  // Multiple locks!
  return (
    <Card className="grid gap-6 mt-10 lg:mt-0">
      <div className="grid gap-6 md:gap-8">
        {Object.keys(checkoutConfig.config.locks)?.map(
          (lockAddress: string) => {
            return (
              <LockPriceDetails
                key={lockAddress}
                lockAddress={lockAddress}
                network={
                  (checkoutConfig.config.locks[
                    Object.keys(checkoutConfig.config.locks)[0]
                  ].network || checkoutConfig.config.network)!
                }
                showContract
              />
            )
          }
        )}
      </div>
      <EmbeddedCheckout checkoutConfig={checkoutConfig} refresh={refresh} />
    </Card>
  )
}
