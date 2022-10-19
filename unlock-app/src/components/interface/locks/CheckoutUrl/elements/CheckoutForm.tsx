import { Tab } from '@headlessui/react'
import React, { useState } from 'react'
import { BasicConfigForm } from './BasicConfigForm'
import { LocksForm } from './LocksForm'

export interface Schema {
  title: string
  children: React.ReactNode
}

export const CheckoutForm = ({
  onAddLocks,
  onBasicConfigChange,
  paywallConfig,
}: any) => {
  const [tabOpen, setTabOpen] = useState(0)

  const tabs: Schema[] = [
    {
      title: 'Base Configuration',
      children: (
        <BasicConfigForm
          onChange={onBasicConfigChange}
          defaultValues={paywallConfig}
        />
      ),
    },
    {
      title: 'Add locks',
      children: (
        <LocksForm onChange={onAddLocks} locks={paywallConfig?.locks} />
      ),
    },
  ]

  return (
    <div className="px-4 py-6 bg-white shadow-sm rounded-xl">
      <Tab.Group defaultIndex={tabOpen}>
        <Tab.List className="flex gap-6">
          {tabs.map(({ title }, index) => (
            <Tab
              key={index}
              className={({ selected }) => {
                return `font-medium outline-none ${
                  selected ? 'text-brand-ui-primary' : ''
                }`
              }}
              onClick={() => setTabOpen(index)}
            >
              {title}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabs?.map(({ children }, index) => {
            return (
              <Tab.Panel key={index}>
                <div className="flex flex-col w-full gap-2 mt-3">
                  <div className="w-full">{children}</div>
                </div>
              </Tab.Panel>
            )
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
