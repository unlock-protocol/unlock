import { Tab } from '@headlessui/react'
import { useState } from 'react'
import { z } from 'zod'

import { BasicPaywallConfigSchema, MetadataInputSchema } from '~/unlockTypes'
import { DynamicForm } from './DynamicForm'

export interface Schema {
  title: string
  name: string
  schema: z.Schema
  description?: Record<string, string>
}

const schemas: Schema[] = [
  {
    title: 'Default Config',
    name: 'baseConfig',
    description: {
      title: 'Title for your checkout. This will show up on the head.',
      icon: 'the URL for a icon to display in the top left corner of the modal.',
      persistentCheckout:
        'true if the modal cannot be closed, defaults to false when embedded. When closed, the user will be redirected to the redirect query param when using a purchase address ',
      referrer:
        'The address which will receive UDT tokens (if the transaction is applicable)',
      messageToSign:
        'If supplied, the user is prompted to sign this message using their wallet. If using a checkout URL, a signature query param is then appended to the redirectUri (see above). If using the embedded paywall, the unlockProtocol.authenticated includes the signature attribute.',
      pessimistic:
        ' By default, to reduce friction, we do not require users to wait for the transaction to be mined before offering them to be redirected. By setting this to true, users will need to wait for the transaction to have been mined in order to proceed to the next step.',
      hideSoldOut:
        'When set to true, sold our locks are not shown to users when they load the checkout modal.',
    },
    schema: BasicPaywallConfigSchema,
  },
  {
    title: 'Add locks',
    name: 'MetadataInputSchema',
    schema: MetadataInputSchema,
  },
]

export const CheckoutForm = () => {
  const [tabOpen, setTabOpen] = useState(0)

  return (
    <div className="px-4 py-6 bg-white rounded-xl">
      <Tab.Group defaultIndex={tabOpen}>
        <Tab.List className="flex gap-6">
          {schemas.map(({ title, name }, index) => (
            <Tab
              key={name}
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
          {schemas?.map(({ title, name, schema, description = {} }) => {
            return (
              <Tab.Panel key={name}>
                <DynamicForm
                  key={name}
                  title={title}
                  name={name}
                  schema={schema}
                  description={description}
                />
              </Tab.Panel>
            )
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
