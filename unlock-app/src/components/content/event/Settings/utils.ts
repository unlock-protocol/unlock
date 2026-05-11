import { PaywallConfigType } from '@unlock-protocol/core'

export const getCheckoutConfigLocks = (checkoutConfig: {
  config: PaywallConfigType
}) => {
  return Object.entries(checkoutConfig.config.locks || {})
    .map(([lockAddress, lockConfig]) => ({
      lockAddress,
      network: lockConfig.network || checkoutConfig.config.network,
    }))
    .filter(
      (
        lock
      ): lock is {
        lockAddress: string
        network: number
      } => !!lock.network
    )
}

export const shouldSyncEventImageToNft = ({
  nextEventImage,
  previousEventImage,
  currentNftImage,
}: {
  nextEventImage?: string
  previousEventImage?: string
  currentNftImage?: string
}) => {
  return (
    !!nextEventImage &&
    !!previousEventImage &&
    nextEventImage !== previousEventImage &&
    currentNftImage === previousEventImage
  )
}
