import { PaywallConfigType } from '@unlock-protocol/core'
import { Placeholder } from '@unlock-protocol/ui'
import { ExplorerLink } from '~/components/interface/AddressLink'
import { useMetadata } from '~/hooks/metadata'

interface LockExplorerLinkProps {
  lockAddress: string
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}
export const LockExplorerLink = ({
  lockAddress,
  checkoutConfig,
}: LockExplorerLinkProps) => {
  const lockCheckoutConfig = checkoutConfig.config.locks[lockAddress]
  const network = lockCheckoutConfig.network || checkoutConfig.config.network!

  const { data: lockMetadata, isLoading: isLockMetadtaLoading } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const name = lockCheckoutConfig.name || lockMetadata?.name

  return (
    <div className="flex gap-2 flex-row text-brand-gray whitespace-nowrap">
      {isLockMetadtaLoading ? (
        <Placeholder.Root className="grid w-full">
          <Placeholder.Line width="full" />
        </Placeholder.Root>
      ) : (
        name
      )}{' '}
      <ExplorerLink address={lockAddress} network={network} />
    </div>
  )
}
