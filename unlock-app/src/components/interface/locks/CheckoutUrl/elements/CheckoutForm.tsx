import { Tab } from '@headlessui/react'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import {
  MetadataInputSchema,
  PaywallConfigLockSchema,
  PaywallConfigSchema,
} from '~/unlockTypes'
import { DynamicForm } from './DynamicForm'

interface Schema {
  title: string
  name: string
  schema: z.Schema
  description?: Record<string, string>
}

const schemas: Schema[] = [
  {
    title: 'Base Config',
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
    schema: PaywallConfigSchema.pick({
      title: true,
      icon: true,
      persistentCheckout: true,
      referrer: true,
      messageToSign: true,
      pessimistic: true,
      hideSoldOut: true,
    }),
  },
  {
    title: 'Locks',
    name: 'MetadataInputSchema',
    schema: MetadataInputSchema,
  },
]

export const CheckoutForm = () => {
  return (
    <Tab.Group defaultIndex={0}>
      <Tab.List className="flex gap-6 p-2 border-b border-gray-400">
        {schemas.map(({ title, name }) => (
          <Tab
            key={name}
            className={({ selected }) => {
              return `font-medium ${selected ? 'text-brand-ui-primary' : ''}`
            }}
          >
            {title}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-6">
        {schemas?.map(({ title, name, schema, description = [] }) => {
          const jsonSchema = zodToJsonSchema(schema, name)
          return (
            <Tab.Panel key={name}>
              <DynamicForm
                key={name}
                title={title}
                schema={jsonSchema?.definitions[name]}
                description={description}
              />
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}
