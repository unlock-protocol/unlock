import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { Icon } from '@unlock-protocol/ui'

interface ViewContractProps {
  lockAddress: string
  network: number
}

export const ViewContract = ({ lockAddress, network }: ViewContractProps) => {
  const config = useConfig()
  const networkConfig = config.networks[network]
  return (
    <a
      href={networkConfig.explorer.urls.address(lockAddress)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-brand-ui-primary hover:opacity-75"
    >
      View contract ({networkConfig.name}){' '}
      <span>
        <Icon icon={ExternalLinkIcon} size="small" />
      </span>
    </a>
  )
}
