import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import {
  AnimationContent,
  DeployStatus,
} from '~/components/interface/locks/Create/elements/CreateLockFormSummary'
import { useConfig } from '~/utils/withConfig'
import { TransactionDetails } from './NewEvent'
import { useEffect, useState } from 'react'
import { getEventPath } from './utils'
import { locksmith } from '~/config/locksmith'
import { EventStatus } from '@unlock-protocol/types'
import { useInterval } from 'react-use'

interface LockDeployingProps {
  transactionDetails: TransactionDetails
  compact?: boolean
}

export const LockDeploying = ({
  transactionDetails,
  compact = false,
}: LockDeployingProps) => {
  const config = useConfig()
  const router = useRouter()
  const [loadingEventPage, setLoadingEventPage] = useState(false)
  const [eventData, setEventData] = useState<{
    status: EventStatus
  }>({
    status: EventStatus.PENDING,
  })
  const { hash: transactionHash, network, slug } = transactionDetails

  // Poll for event status every 2 seconds
  useInterval(async () => {
    if (slug) {
      const { data: event } = await locksmith.getEvent(slug)
      setEventData({
        status: event.data?.status as EventStatus,
      })
    }
  }, 2000)

  let status: DeployStatus = 'progress'
  let title = 'Waiting for your transaction to be mined'
  let message = compact
    ? 'Please do not close this drawer'
    : 'Please do not close this window'

  useEffect(() => {
    window?.scrollTo(0, 0)
  }, [])

  if (eventData.status === EventStatus.DEPLOYED) {
    status = 'deployed'
    title = '🚀​ Your contract was successfully deployed'
    message =
      'Did you know that you can airdrop tickets to your fren by sending them email?'
  }

  const goToEventPage = () => {
    if (slug) {
      setLoadingEventPage(true)
      router.push(
        getEventPath({
          event: {
            slug,
          },
        })
      )
    }
  }

  return (
    <div>
      <div className="flex flex-col items-stretch p-4 border border-gray-400 rounded-xl">
        <AnimationContent status={status} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col">
            <span className={`text-base ${compact ? 'text-sm' : ''}`}>
              Status
            </span>
            <span className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>
              {status === 'progress' ? 'In progress...' : 'Deployed'}
            </span>
          </div>
          {config.networks[network].explorer?.urls?.transaction && (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-3 mt-3 font-bold lg:mt-auto lg:ml-auto text-brand-ui-primary ${compact ? 'text-base' : 'text-lg'}`}
              href={config.networks[network].explorer.urls.transaction(
                transactionHash
              )}
            >
              View on block explorer
              <ExternalLinkIcon size={compact ? 16 : 20} />
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center my-12 text-center">
        <h3
          className={`block mb-4 font-bold ${compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-4xl'}`}
        >
          {title}
        </h3>
        <span className={`mb-4 font-base ${compact ? 'text-sm' : ''}`}>
          {message}
        </span>
        {status === 'deployed' && !compact && (
          <div className="flex flex-col items-center content-center text-center">
            <p>We made a page for your event! Go check it out!</p>
            <Button
              loading={loadingEventPage}
              className="my-4"
              onClick={goToEventPage}
            >
              View event page
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
