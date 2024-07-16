import { PaywallLockConfigType } from '@unlock-protocol/core'
import { Placeholder } from '@unlock-protocol/ui'
import { ExplorerLink } from '~/components/interface/AddressLink'
import { useMetadata } from '~/hooks/metadata'

interface LockExplorerLinkProps {
  lockAddress: string
  network: number
  lockCheckoutConfig: PaywallLockConfigType
}
export const LockExplorerLink = ({
  lockAddress,
  network,
  lockCheckoutConfig,
}: LockExplorerLinkProps) => {
  const { data: lockMetadata, isLoading: isLockMetadtaLoading } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const name = lockCheckoutConfig.name || lockMetadata?.name

  return (
    <div className="flex gap-2 flex-row text-brand-gray">
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
