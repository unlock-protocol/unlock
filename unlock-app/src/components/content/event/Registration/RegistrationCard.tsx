import { LockPriceDetails } from './LockPriceDetails'
import { Card } from '@unlock-protocol/ui'
import { PaywallConfigType } from '@unlock-protocol/core'
import { RegistrationCardSingleLock } from './SingleLock'
import { useValidKeyBulk } from '~/hooks/useKey'
import { HasTicket } from './HasTicket'
import { EmbeddedCheckout } from './EmbeddedCheckout'
import { useState } from 'react'

export interface RegistrationCardProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
  requiresApproval: boolean
  hideRemaining: boolean
}

export const RegistrationCard = ({
  requiresApproval,
  checkoutConfig,
  hideRemaining,
}: RegistrationCardProps) => {
  const [hasRefreshed, setHasRefreshed] = useState(false)
  // Check if the user has a key!
  const queries = useValidKeyBulk(checkoutConfig.config.locks)

  // Refresh function once the user has a key.
  const refresh = async () => {
    setHasRefreshed(true)
    await queries.map((query) => query.refetch())
  }

  const hasValidKey = queries?.some((query) => query.isSuccess && !!query.data)

  // We don't show a "loading" state when checking if the user has valid keys
  // because if the user was logging in from inside the modal, it would result in the modal being closed.
  if (hasValidKey) {
    return (
      <HasTicket hasRefreshed={hasRefreshed} checkoutConfig={checkoutConfig} />
    )
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
          hideRemaining={hideRemaining}
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
              hideRemaining={hideRemaining}
            />
          )
        })}
      <EmbeddedCheckout checkoutConfig={checkoutConfig} refresh={refresh} />
    </Card>
  )
}
