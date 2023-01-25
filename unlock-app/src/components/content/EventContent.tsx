import React from 'react'
import Head from 'next/head'
import { Button, Tooltip } from '@unlock-protocol/ui'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import { useMetadata } from '~/hooks/metadata'
import LoadingIcon from '../interface/Loading'
import { AddressLink } from '../interface/AddressLink'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { FaCalendar, FaRegCalendarPlus, FaClock } from 'react-icons/fa'
import { GoLocation } from 'react-icons/go'
import { FiTwitter } from 'react-icons/fi'
import Link from 'next/link'

const formatEventData = (metadata: any) => {
  const accentColor = metadata.background_color
    ? `#${metadata.background_color}`
    : 'bg-ui-secondary-200'

  let date, time, address

  metadata.attributes.forEach(({ trait_type, value }) => {
    if (trait_type === 'event_start_date') {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }

      date = new Date(Date.parse(value)).toLocaleDateString(undefined, options)
    } else if (trait_type === 'event_start_time') {
      time = value
    } else if (trait_type === 'event_address') {
      address = value
    }
  })

  return {
    title: metadata.name,
    description: metadata.description, // in Markdown!
    image: metadata.image,
    date,
    time,
    address,
    accentColor,
  }
}

export const EventContent = () => {
  const router = useRouter()
  if (!router.query) {
    return <LoadingIcon></LoadingIcon>
  }

  return (
    <AppLayout showLinks={false} authRequired={false} title="">
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>
      <div className="md:w-3/4 m-auto">
        {(!router.query.lockAddress || !router.query.network) && (
          <p>
            Use Unlock to sell tickets for your event:{' '}
            <Link className="underline" href="/locks/create">
              start by deploying your contract.
            </Link>
          </p>
        )}
        {router.query.lockAddress && router.query.network && (
          <EventDetails
            lockAddress={router.query.lockAddress.toString()}
            network={parseInt(router.query.network.toString(), 10)}
          />
        )}
      </div>
    </AppLayout>
  )
}

interface EventDetailsProps {
  lockAddress: string
  network: number
}

export const EventDetails = ({ lockAddress, network }: EventDetailsProps) => {
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })

  if (isMetadataLoading) {
    return <LoadingIcon></LoadingIcon>
  }

  if (!metadata?.attributes) {
    return <p>Not an event!</p>
  }

  const eventData = formatEventData(metadata)

  const addToCalendar = () => {
    alert('AA')
  }

  const shareOnTwitter = () => {
    alert('TT')
  }

  return (
    <main className="grid md:grid-cols-[minmax(0,_1fr)_300px] gap-8 mt-8">
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
          <li className="mb-2">
            <FaCalendar className="inline mr-2" />
            {eventData.date}
          </li>
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
        <div className="markdown">
          {/* eslint-disable-next-line react/no-children-prop */}
          <ReactMarkdown children={eventData.description}></ReactMarkdown>
        </div>
      </section>
      <section className="flex flex flex-col items-center">
        <img alt={eventData.title} className="mb-5" src={eventData.image} />
        <ul className="flex justify-around w-1/2">
          <li className="bg-gray-200 rounded-full">
            <Tooltip
              label="Add to Calendar"
              tip="Add to Calendar"
              side="bottom"
            >
              <button
                onClick={addToCalendar}
                className="w-12 h-12 flex justify-center items-center"
              >
                <FaRegCalendarPlus className="w-6 h-6" />
              </button>
            </Tooltip>
          </li>
          <li className="bg-gray-200 rounded-full">
            <Tooltip
              label="Share on Twitter"
              tip="Share on Twitter"
              side="bottom"
            >
              <button
                onClick={shareOnTwitter}
                className="w-12 h-12 flex justify-center items-center"
              >
                <FiTwitter className="w-6 h-6" />
              </button>
            </Tooltip>
          </li>
        </ul>
      </section>
      <section className="mb-8">
        <Button
          className="mt-8 w-full"
          style={{ backgroundColor: eventData.accentColor }}
        >
          Register
        </Button>
      </section>
    </main>
  )
}

export default EventContent
