'use client'

import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import EventList from '~/components/interface/locks/List/elements/EventList'
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
          <Link href="/event/new">
            <Button className="w-full md:w-auto md:ml-auto" size="large">
              Create new event
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <SectionHeader />
      <EventList />
    </>
  )
}
