'use client'

import { IoTicketSharp } from 'react-icons/io5'
import { MdOutlineCollections } from 'react-icons/md'

import { Button } from '@unlock-protocol/ui'
import { Disclosure } from '@headlessui/react'

import Link from 'next/link'
import EventList from '~/components/interface/locks/List/elements/EventList'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
} from 'react-icons/ri'

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
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="flex flex-col gap-2">
            <Disclosure.Button className="flex items-center justify-between w-full outline-none ring-0">
              <h2 className="text-lg font-bold text-brand-ui-primary">
                My events
              </h2>
              {open ? (
                <UpIcon className="fill-brand-ui-primary" size={24} />
              ) : (
                <DownIcon className="fill-brand-ui-primary" size={24} />
              )}
            </Disclosure.Button>

            <Disclosure.Panel>
              <div className="flex flex-col gap-6">
                <EventList />
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </>
  )
}
