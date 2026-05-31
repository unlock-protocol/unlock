'use client'

import { IoTicketSharp } from 'react-icons/io5'
import { MdOutlineCollections } from 'react-icons/md'

import { Button } from '@unlock-protocol/ui'
import { Tab } from '@headlessui/react'

import Link from 'next/link'
import EventList from '~/components/interface/locks/List/elements/EventList'
import EventCollectionList from '~/components/interface/locks/List/elements/EventCollectionList'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import {
  getMyEventsTabClassName,
  myEventsTabListAriaLabel,
  myEventsTabs,
} from '~/utils/myEventsTabs'

export default function MyEventsContent() {
  const { account } = useAuthenticate()

  const SectionHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-5">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold">My Events</h1>
          <span className="block max-w-lg text-base text-gray-700">
            Create and manage your events on Unlock Protocol.
          </span>
        </div>
        {account && (
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:gap-4">
            <Link href="/events/new-collection">
              <Button
                iconLeft={<MdOutlineCollections />}
                className="w-full sm:w-auto"
                size="medium"
              >
                New collection
              </Button>
            </Link>
            <Link href="/event/new">
              <Button
                iconLeft={<IoTicketSharp />}
                className="w-full sm:w-auto"
                size="medium"
              >
                Host an event
              </Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <SectionHeader />
      <Tab.Group>
        <Tab.List
          aria-label={myEventsTabListAriaLabel}
          className="flex flex-wrap gap-2 mt-8 border-b border-gray-300"
        >
          <Tab className={getMyEventsTabClassName}>
            <IoTicketSharp />
            <span>{myEventsTabs[0].label}</span>
          </Tab>
          <Tab className={getMyEventsTabClassName}>
            <MdOutlineCollections />
            <span>{myEventsTabs[1].label}</span>
          </Tab>
        </Tab.List>
        <Tab.Panels className="pt-6">
          <Tab.Panel>
            <div className="flex flex-col gap-6">
              <EventList />
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="flex flex-col gap-6">
              <EventCollectionList />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  )
}
