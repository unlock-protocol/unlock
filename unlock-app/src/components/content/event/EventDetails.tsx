import fontColorContrast from 'font-color-contrast'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { GoLocation } from 'react-icons/go'
import { FaCalendar, FaClock } from 'react-icons/fa'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

import { useAuth } from '~/contexts/AuthenticationContext'
import { useMetadata } from '~/hooks/metadata'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { selectProvider } from '~/hooks/useAuthenticate'
import LoadingIcon from '~/components/interface/Loading'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Button, Modal } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { AddressLink } from '~/components/interface/AddressLink'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'
import { getEventDate } from './utils'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'

interface EventDetailsProps {
  lockAddress: string
  network: number
}

export const EventDetails = ({ lockAddress, network }: EventDetailsProps) => {
  const { account } = useAuth()
  const web3Service = useWeb3Service()
  const config = useConfig()

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })

  const { data: hasValidKey, isInitialLoading: isHasValidKeyLoading } =
    useQuery(
      ['hasValidKey', network, lockAddress, account],
      async () => {
        return web3Service.getHasValidKey(lockAddress, account!, network)
      },
      {
        enabled: !!account,
      }
    )

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  if (isMetadataLoading || isHasValidKeyLoading) {
    return <LoadingIcon></LoadingIcon>
  }

  if (!metadata?.attributes) {
    return <p>Not an event!</p>
  }

  const eventData = toFormData(metadata)
  const eventDate = getEventDate(eventData.ticket)

  const injectedProvider = selectProvider(config)

  const paywallConfig = {
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
      },
    },
  }

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  return (
    <main className="grid md:grid-cols-[minmax(0,_1fr)_300px] gap-8 mt-8">
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={paywallConfig}
          handleClose={() => setCheckoutOpen(false)}
        />
      </Modal>

      <section className="">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          {eventData.name}
        </h1>
        <p className="flex flex-rows gap-2 mb-4">
          <span className="text-brand-gray">Ticket contract</span>
          <AddressLink
            lockAddress={lockAddress}
            network={network}
          ></AddressLink>
        </p>
        <ul
          className="bold text-xl md:text-2xl mb-6"
          style={{ color: `#${eventData.background_color}` }}
        >
          {eventDate && (
            <li className="mb-2">
              <FaCalendar className="inline mr-2" />
              {eventDate.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </li>
          )}
          {eventDate && eventData.ticket?.event_start_time && (
            <li className="mb-2">
              <FaClock className="inline mr-2" />
              {eventDate.toLocaleTimeString()}
            </li>
          )}
          <li className="mb-2">
            <Link
              target="_blank"
              href={`https://www.google.com/maps/search/?api=1&query=${eventData.ticket?.event_address}`}
            >
              <GoLocation className="inline mr-2" />
              {eventData.ticket?.event_address}
            </Link>
          </li>
        </ul>
        {eventData.description && (
          <div className="markdown">
            {/* eslint-disable-next-line react/no-children-prop */}
            <ReactMarkdown children={eventData.description} />
          </div>
        )}
      </section>

      <section className="flex flex-col items-center">
        <img
          alt={eventData.title}
          className="mb-5 aspect-auto	"
          src={eventData.image}
        />
        <ul className="flex justify-around w-1/2">
          <li className="bg-gray-200 rounded-full">
            <AddToCalendarButton event={eventData} />
          </li>
          <li className="bg-gray-200 rounded-full">
            <TweetItButton event={eventData} />
          </li>
        </ul>
      </section>
      <section className="flex flex-col mb-8">
        {!hasValidKey && (
          <Button
            variant="primary"
            size="medium"
            className="md:w-1/2"
            style={{
              backgroundColor: `#${eventData.background_color}`,
              color: `#${eventData.background_color}`
                ? fontColorContrast(`#${eventData.background_color}`)
                : 'white',
            }}
            onClick={() => setCheckoutOpen(true)}
          >
            Register
          </Button>
        )}
        {hasValidKey && (
          <p className="text-lg">
            🎉 You already have a ticket! You can view it in{' '}
            <Link className="underline" href="/keychain">
              your keychain
            </Link>
            .
          </p>
        )}
        {isLockManager && (
          <>
            <p className="mt-12 mb-4 text-sm">
              Want to change something? You can update anytime by accessing your
              contract (Lock) on the Unlock Dashboard.
            </p>
            <Button
              onClick={onEdit}
              variant="black"
              className="border md:w-1/2"
              size="small"
            >
              Edit Details
            </Button>
          </>
        )}
      </section>
    </main>
  )
}

export default EventDetails
