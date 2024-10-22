'use client'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { SettingsContext } from '~/components/interface/locks/Settings'
import { Tab } from '@headlessui/react'

import { ReactNode, useState } from 'react'

import Link from 'next/link'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { Managers } from './settings/Managers'
import { General } from './settings/General'
import { Approvals } from './settings/Approvals'
import { ManageEvents } from './settings/Management'
import { isCollectionManager } from '~/utils/eventCollections'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface EventCollectionSettingsProps {
  eventCollection: EventCollection
}

export const EventCollectionSettings = ({
  eventCollection,
}: EventCollectionSettingsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { account } = useAuthenticate()

  const isManager = isCollectionManager(
    eventCollection.managerAddresses,
    account!
  )

  const tabs: {
    label: string
    description?: string
    id: 'general' | 'managers' | 'approvals' | 'management'
    children: ReactNode
  }[] = [
    {
      id: 'general',
      label: 'General',
      description:
        "Update your event collection's public information such as its location, date and more!",
      children: eventCollection ? (
        <General eventCollection={eventCollection} />
      ) : null,
    },
    {
      id: 'managers',
      label: 'Managers',
      description: 'Add or remove managers to/from your event collection.',
      children: eventCollection ? (
        <Managers eventCollection={eventCollection} />
      ) : null,
    },
    {
      id: 'approvals',
      label: 'Approvals',
      description: 'Review and approve events submitted to your collection.',
      children: eventCollection ? (
        <Approvals eventCollection={eventCollection} />
      ) : null,
    },
    {
      id: 'management',
      label: 'Management',
      description: 'Manage events in your collection.',
      children: eventCollection ? (
        <ManageEvents eventCollection={eventCollection} />
      ) : null,
    },
  ]

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don&apos;t have access to this page.
        </p>
        <Link
          href={`/events/${eventCollection.slug}`}
          className="mt-4 text-brand-ui-primary hover:underline"
        >
          Back to Event Collection
        </Link>
      </div>
    )
  }

  return (
    eventCollection && (
      <SettingsContext.Provider value={{ setTab: setSelectedIndex }}>
        <div className="flex flex-row gap-4 align-center items-center">
          <Link href={`/events/${eventCollection.slug}`}>
            <ArrowBackIcon size={20} />
          </Link>
          <div className="w-16 h-16 overflow-hidden bg-cover rounded-2xl">
            <img
              className="object-cover w-full m-auto aspect-1 rounded-2xl"
              src={eventCollection.coverImage || '/default-cover.png'}
              alt={eventCollection.title}
            />
          </div>
          <div>
            <span className="text-xl font-bold text-brand-dark">
              {eventCollection.title} /
            </span>{' '}
            <span className="text-xl text-gray-600">Settings</span>
          </div>
        </div>

        <Tab.Group
          vertical
          defaultIndex={1}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        >
          <div className="flex flex-col gap-6 my-8 md:gap-10 md:grid md:grid-cols-5">
            <div className="md:col-span-1">
              <Tab.List className="flex flex-col gap-4">
                {tabs.map(({ label }, index) => {
                  const isActive = index === selectedIndex
                  return (
                    <Tab
                      className={`px-4 py-2 text-lg font-bold text-left rounded-lg outline-none ${
                        isActive
                          ? 'bg-brand-primary text-brand-dark'
                          : 'text-gray-500'
                      }`}
                      key={index}
                    >
                      {label}
                    </Tab>
                  )
                })}
              </Tab.List>
            </div>
            <div className="md:col-span-4">
              <Tab.Panels>
                {tabs.map(({ label, description, children }, index) => (
                  <Tab.Panel className="flex flex-col gap-10" key={index}>
                    <div className="flex flex-col gap-4">
                      <h2 className="text-2xl font-bold md:text-4xl text-brand-dark">
                        {label}
                      </h2>
                      {description && (
                        <span className="text-base text-brand-dark">
                          {description}
                        </span>
                      )}
                    </div>
                    {children}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </div>
          </div>
        </Tab.Group>
      </SettingsContext.Provider>
    )
  )
}
