import { PaywallConfigType } from '@unlock-protocol/core'
import { LockExplorerLink } from './LockExplorerLink'

export const EventLocksExplorerLinks = ({
  checkoutConfig,
}: {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <p className="whitespace-nowrap">Contracts : </p>
      {Object.keys(checkoutConfig.config.locks)
        ?.sort((l, m) => {
          return (
            (checkoutConfig.config.locks[l].order || 0) -
            (checkoutConfig.config.locks[m].order || 0)
          )
        })
        ?.map((lockAddress: string) => {
          return (
            <LockExplorerLink
              key={lockAddress}
              lockAddress={lockAddress}
              checkoutConfig={checkoutConfig}
            />
          )
        })}
    </div>
  )
}
