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
import {
  Attribute,
  Metadata,
} from '~/components/interface/locks/metadata/utils'
import { Button, Modal } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { AddressLink } from '~/components/interface/AddressLink'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'

export interface EventData {
  title: string
  description: string
  image: string
  date: Date
  time: string
  address: string
  accentColor?: string
  url?: string
}

const formatEventData = (metadata: Partial<Metadata>): Partial<EventData> => {
  const accentColor = metadata.background_color
    ? `#${metadata.background_color}`
    : 'bg-ui-secondary-200'

  let date, time, address, url
  if (metadata.attributes) {
    metadata.attributes.forEach(({ trait_type, value }: Attribute) => {
      if (trait_type === 'event_start_date') {
        date = new Date(Date.parse(value.toString()))
      } else if (trait_type === 'event_start_time') {
        time = value
      } else if (trait_type === 'event_address') {
        address = value
      } else if (trait_type === 'event_url') {
        url = value
      }
    })
  }

  return {
    title: metadata.name,
    description: metadata.description, // in Markdown!
    image: metadata.image,
    date,
    time,
    address,
    accentColor,
    url,
  }
}

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

  if (isMetadataLoading || isHasValidKeyLoading) {
    return <LoadingIcon></LoadingIcon>
  }

  if (!metadata?.attributes) {
    return <p>Not an event!</p>
  }

  const eventData = formatEventData(metadata)

  const injectedProvider = selectProvider(config)

  const paywallConfig = {
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
      },
    },
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
          {eventData.title}
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
          style={{ color: eventData.accentColor }}
        >
          {eventData.date && (
            <li className="mb-2">
              <FaCalendar className="inline mr-2" />
              {eventData.date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </li>
          )}
          <li className="mb-2">
            <FaClock className="inline mr-2" />
            {eventData.time}
          </li>
          <li className="mb-2">
            <Link
              target="_blank"
              href={`https://www.google.com/maps/search/?api=1&query=${eventData.address}`}
            >
              <GoLocation className="inline mr-2" />
              {eventData.address}
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
      <section className="flex flex flex-col items-center">
        <img alt={eventData.title} className="mb-5" src={eventData.image} />
        <ul className="flex justify-around w-1/2">
          <li className="bg-gray-200 rounded-full">
            <AddToCalendarButton event={eventData} />
          </li>
          <li className="bg-gray-200 rounded-full">
            <TweetItButton event={eventData} />
          </li>
        </ul>
      </section>
      <section className="mb-8">
        {!hasValidKey && (
          <Button
            className="h-12 w-full md:w-96"
            style={{
              backgroundColor: eventData.accentColor,
              color: fontColorContrast(eventData.accentColor),
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
      </section>
    </main>
  )
}

export default EventDetails
