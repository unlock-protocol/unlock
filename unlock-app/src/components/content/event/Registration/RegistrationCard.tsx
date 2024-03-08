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
  requiresApproval: boolean
}

export const RegistrationCard = ({
  requiresApproval,
  checkoutConfig,
}: RegistrationCardProps) => {
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
      <Card className="grid gap-4 mt-10 lg:mt-0">
        <RegistrationCardSingleLock
          requiresApproval={requiresApproval}
          refresh={refresh}
          checkoutConfig={checkoutConfig}
        />
      </Card>
    )
  }

  // Multiple locks!
  return (
    <Card className="grid gap-4 mt-10 lg:mt-0">
      {Object.keys(checkoutConfig.config.locks)
        ?.sort((l, m) => {
          return (
            (checkoutConfig.config.locks[l].order || 0) -
            (checkoutConfig.config.locks[m].order || 0)
          )
        })
        ?.map((lockAddress: string) => {
          return (
            <LockPriceDetails
              key={lockAddress}
              lockAddress={lockAddress}
              network={
                (checkoutConfig.config.locks[
                  Object.keys(checkoutConfig.config.locks)[0]
                ].network || checkoutConfig.config.network)!
              }
              lockCheckoutConfig={checkoutConfig.config.locks[lockAddress]}
              showContract
            />
          )
        })}
      <EmbeddedCheckout checkoutConfig={checkoutConfig} refresh={refresh} />
    </Card>
  )
}
