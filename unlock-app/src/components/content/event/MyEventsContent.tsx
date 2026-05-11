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
        <Tab.List className="flex flex-wrap gap-2 mt-8 border-b border-gray-300">
          <Tab
            className={({ selected }) =>
              [
                'flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 outline-none',
                selected
                  ? 'border-brand-ui-primary text-brand-ui-primary'
                  : 'border-transparent text-gray-700 hover:text-brand-ui-primary',
              ].join(' ')
            }
          >
            <IoTicketSharp />
            <span>My events</span>
          </Tab>
          <Tab
            className={({ selected }) =>
              [
                'flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 outline-none',
                selected
                  ? 'border-brand-ui-primary text-brand-ui-primary'
                  : 'border-transparent text-gray-700 hover:text-brand-ui-primary',
              ].join(' ')
            }
          >
            <MdOutlineCollections />
            <span>My event collections</span>
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
