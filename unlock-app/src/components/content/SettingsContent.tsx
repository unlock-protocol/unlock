'use client'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { ReactNode, useState } from 'react'
import { SettingsContext } from '~/components/interface/locks/Settings'
import { PaymentSettings } from '../interface/user-account/PaymentSettings'
import AccountInfo from '../interface/user-account/AccountInfo'
import { Funding } from '../interface/user-account/Funding'

export const SettingsContent = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const tabs: {
    label: string
    description?: string
    id: 'account' | 'payments' | 'funding'
    children: ReactNode
  }[] = [
    {
      id: 'account',
      label: 'Account',
      description:
        'Manage your account information including your wallet and email address.',
      children: <AccountInfo />,
    },
    {
      id: 'payments',
      label: 'Card Payments',
      description: 'Configure your credit card payment settings.',
      children: <PaymentSettings />,
    },
    {
      id: 'funding',
      label: 'Funding',
      description: 'Fund your account with ETH.',
      children: <Funding />,
    },
  ]

  return (
    <SettingsContext.Provider value={{ setTab: setSelectedIndex }}>
      <TabGroup
        vertical
        defaultIndex={0}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      >
        <div className="flex flex-col gap-6 my-8 md:gap-10 md:grid md:grid-cols-5">
          <div className="md:col-span-1">
            <TabList className="flex flex-col gap-4">
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
            </TabList>
          </div>
          <div className="md:col-span-4">
            <TabPanels>
              {tabs.map(({ label, description, children }, index) => (
                <TabPanel className="flex flex-col gap-10" key={index}>
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
                </TabPanel>
              ))}
            </TabPanels>
          </div>
        </div>
      </TabGroup>
    </SettingsContext.Provider>
  )
}

export default SettingsContent
