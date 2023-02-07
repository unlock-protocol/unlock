import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { useUpdateMetadata } from '~/hooks/metadata'

import {
  AnimationContent,
  DeployStatus,
} from '~/components/interface/locks/Create/elements/CreateLockFormSummary'
import { useConfig } from '~/utils/withConfig'
import { TransactionDetails } from './NewEvent'
import { useEffect } from 'react'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'
import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'

interface LockDeployingProps {
  transactionDetails: TransactionDetails
  lockAddress?: string
  metadata?: MetadataFormData
}

export const LockDeploying = ({
  transactionDetails,
  lockAddress,
  metadata,
}: LockDeployingProps) => {
  const config = useConfig()
  const router = useRouter()
  const { hash: transactionHash, network } = transactionDetails
  const { mutateAsync: updateMetadata, isLoading: isMetadataUpating } =
    useUpdateMetadata({
      lockAddress,
      network,
    })

  useEffect(() => {
    const save = async (metadata: MetadataFormData) => {
      await updateMetadata(formDataToMetadata(metadata!))
    }
    if (metadata) {
      save(metadata)
    }
  }, [updateMetadata, metadata])

  let status: DeployStatus = 'progress'
  let title = 'Waiting for your transaction to be mined'
  let message = 'Please do not close this window'

  if (lockAddress && !isMetadataUpating) {
    status = 'deployed'
    title = '🚀​ Contract is successfully deployed'
    message =
      'Did you know that you can airdrop tickets to your fren by sending them email?'
  }

  const goToEventPage = () => {
    if (lockAddress) {
      router.push(`/event?lockAddress=${lockAddress}&network=${network}`)
    }
  }

  return (
    <div>
      <div className="flex flex-col items-stretch border border-gray-400 rounded-xl p-4">
        <AnimationContent status={status} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-base">Status</span>
            <span className="text-lg font-bold">
              {status === 'progress' ? 'In progress...' : 'Deployed'}
            </span>
          </div>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mt-3 text-lg font-bold lg:mt-auto lg:ml-auto text-brand-ui-primary"
            href={config.networks[network].explorer.urls.transaction(
              transactionHash
            )}
          >
            View on block explorer
            <ExternalLinkIcon size={20} />
          </Link>{' '}
        </div>
      </div>
      <div className="flex flex-col items-center my-12 text-center">
        <h3 className="block mb-4 text-2xl font-bold md:text-4xl">{title}</h3>
        <span className="mb-4 font-base">{message}</span>
        {status === 'deployed' && (
          <div className="flex flex-col items-center content-center text-center">
            <p>We made a page for your event! Go check it out!</p>
            <Button className="my-4" onClick={goToEventPage}>
              View event page
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
