'use client'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { SettingsContext } from '~/components/interface/locks/Settings'
import { Tab } from '@headlessui/react'

import { ReactNode, useState } from 'react'
import { PaywallConfigType } from '@unlock-protocol/core'
import { General } from './General'
import { Referrals } from './Referrals'
import { Emails } from './Emails'
import { Verifiers } from './Verifiers'
import Link from 'next/link'
import { useEvent } from '~/hooks/useEvent'
import { SettingTab } from '../../lock/LocksSettingsContent'

interface EventSettingsProps {
  slug: string
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const EventSettings = ({ slug, checkoutConfig }: EventSettingsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { data: event } = useEvent({ slug: slug })

  const tabs: {
    label: string
    description?: string
    id: SettingTab
    children: ReactNode
  }[] = [
    {
      id: 'general',
      label: 'General',
      description:
        "Update your event's public information such as its location, date and more!",
      children: <General event={event} checkoutConfig={checkoutConfig} />,
    },
    {
      id: 'referrals',
      label: 'Referrals',
      description:
        'Create referral links to share with your community and reward them.',
      children: <Referrals event={event} checkoutConfig={checkoutConfig} />,
    },
    {
      id: 'emails',
      label: 'Emails',
      description: 'Configure and send emails to the attendees of your event.',
      children: <Emails event={event} checkoutConfig={checkoutConfig} />,
    },
    {
      id: 'verifiers',
      label: 'Verifiers',
      description:
        'Verify ticket validity and handle attendees who have checked-in',
      children: <Verifiers event={event} checkoutConfig={checkoutConfig} />,
    },
    // {
    //   id: 'checkout',
    //   label: 'Checkout',
    //   children: <p>Checkout</p>,
    //   description: 'Customize the checkout experience for your event.',
    // },
    // {
    //   id: 'emails',
    //   label: 'Emails',
    //   children: <p>Emails</p>,
    //   description: 'Customize the emails sent to your attendees.',
    // },
    // {
    //   id: 'verifiers',
    //   label: 'Verifiers',
    //   children: <p>Verifiers</p>,
    //   description:
    //     'Membership Terms include the price, currency, duration, payment mechanisms... as well as cancellation terms and transfer fees.',
    // },
  ]

  return (
    event && (
      <SettingsContext.Provider
        value={{
          setTab: setSelectedIndex,
        }}
      >
        <div className="flex flex-row gap-4 align-center items-center">
          <Link href={`/event/${event.slug}`}>
            <ArrowBackIcon size={20} />
          </Link>
          <div className="w-16 h-16 overflow-hidden bg-cover rounded-2xl">
            <img
              className="object-cover w-full m-auto aspect-1 rounded-2xl"
              src={event.image}
              alt={event.name}
            />
          </div>
          <div>
            <span className="text-xl font-bold text-brand-dark">
              {event.name} /
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
                {tabs?.map(({ label }, index) => {
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
              <div className="flex flex-col gap-10 md:grid md:grid-cols-4">
                <div className="md:col-span-4">
                  <Tab.Panels>
                    {tabs?.map(({ label, description, children }, index) => {
                      return (
                        <Tab.Panel className="flex flex-col gap-10" key={index}>
                          <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold md:text-4xl text-brand-dark">
                              {label}
                            </h2>
                            <span className="text-base text-brand-dark">
                              {description}
                            </span>
                          </div>
                          <div>{children}</div>
                        </Tab.Panel>
                      )
                    })}
                  </Tab.Panels>
                </div>
              </div>
            </div>
          </div>
        </Tab.Group>
      </SettingsContext.Provider>
    )
  )
}
