import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { AnimationContent } from '~/components/interface/locks/Create/elements/CreateLockFormSummary'
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
  const [eventStatus, setEventStatus] = useState<EventStatus>(
    EventStatus.PENDING
  )
  const { hash: transactionHash, network, slug } = transactionDetails

  const [title, setTitle] = useState('Waiting for your transaction to be mined')
  const [message, setMessage] = useState(
    compact
      ? 'Please do not close this drawer'
      : 'Please do not close this window'
  )

  // Update title and message when event is deployed
  useEffect(() => {
    if (eventStatus === EventStatus.DEPLOYED) {
      setTitle('🚀​ Your contract was successfully deployed')
      setMessage(
        'Did you know that you can airdrop tickets to your fren by sending them email?'
      )
    }
  }, [eventStatus])

  // Poll for event status every 5 seconds
  useInterval(
    async () => {
      if (!slug) return
      try {
        const { data: event } = await locksmith.getEvent(slug)
        // @ts-ignore
        setEventStatus(event.status as EventStatus)
      } catch (error) {
        console.error('Failed to fetch event status:', error)
      }
    },
    eventStatus === EventStatus.DEPLOYED ? null : 5000
  )

  // Scroll to top on mount
  useEffect(() => {
    window?.scrollTo(0, 0)
  }, [])

  const goToEventPage = () => {
    if (!slug) return
    setLoadingEventPage(true)
    router.push(
      getEventPath({
        event: { slug },
      })
    )
  }

  const renderBlockExplorerLink = () => {
    const explorerUrl = config.networks[network].explorer?.urls?.transaction
    if (!explorerUrl) return null

    return (
      <Link
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 mt-3 font-bold lg:mt-auto lg:ml-auto text-brand-ui-primary ${
          compact ? 'text-base' : 'text-lg'
        }`}
        href={explorerUrl(transactionHash)}
      >
        View on block explorer
        <ExternalLinkIcon size={compact ? 16 : 20} />
      </Link>
    )
  }

  return (
    <div>
      <div className="flex flex-col items-stretch p-4 border border-gray-400 rounded-xl">
        <AnimationContent
          status={
            eventStatus === EventStatus.DEPLOYED ? 'deployed' : 'progress'
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col">
            <span className={`text-base ${compact ? 'text-sm' : ''}`}>
              Status
            </span>
            <span className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>
              {eventStatus === EventStatus.DEPLOYED
                ? 'Deployed'
                : 'In progress...'}
            </span>
          </div>
          {renderBlockExplorerLink()}
        </div>
      </div>

      <div className="flex flex-col items-center my-12 text-center">
        <h3
          className={`block mb-4 font-bold ${
            compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-4xl'
          }`}
        >
          {title}
        </h3>
        <span className={`mb-4 font-base ${compact ? 'text-sm' : ''}`}>
          {message}
        </span>
        {eventStatus === EventStatus.DEPLOYED && !compact && (
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
