'use client'

import { IoTicketSharp } from 'react-icons/io5'
import { MdOutlineCollections } from 'react-icons/md'

import { Button } from '@unlock-protocol/ui'
import { Tab } from '@headlessui/react'

import Link from 'next/link'
import EventList from '~/components/interface/locks/List/elements/EventList'
import EventCollectionList from '~/components/interface/locks/List/elements/EventCollectionList'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export default function MyEventsContent() {
  const { account } = useAuthenticate()

  const tabs = [
    {
      label: 'My events',
      children: <EventList />,
    },
    {
      label: 'My event collections',
      children: <EventCollectionList />,
    },
  ]

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
          <div className="flex flex-row items-center gap-4">
            <Link href="/events/new-collection">
              <Button
                iconLeft={<MdOutlineCollections />}
                className="w-full md:w-auto md:ml-auto"
                size="medium"
              >
                New collection
              </Button>
            </Link>
            <Link href="/event/new">
              <Button
                iconLeft={<IoTicketSharp />}
                className="w-full md:w-auto md:ml-auto"
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
        <Tab.List className="flex gap-2 border-b border-gray-300">
          {tabs.map(({ label }, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `px-4 py-2 text-base font-semibold outline-none transition-colors border-b-2 ${
                  selected
                    ? 'border-brand-ui-primary text-brand-ui-primary'
                    : 'border-transparent text-gray-600 hover:text-brand-ui-primary'
                }`
              }
            >
              {label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map(({ children }, index) => (
            <Tab.Panel key={index} className="flex flex-col gap-6">
              {children}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </>
  )
}
