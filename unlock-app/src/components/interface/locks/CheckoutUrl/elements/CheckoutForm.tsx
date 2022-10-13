import { Tab } from '@headlessui/react'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { MetadataInputSchema, PaywallConfigLockSchema } from '~/unlockTypes'
import { DynamicForm } from './DynamicForm'

interface Schema {
  title: string
  name: string
  schema: z.Schema
}

const schemas: Schema[] = [
  {
    title: 'Paywall Config',
    name: 'paywallConfig',
    schema: PaywallConfigLockSchema,
  },
  {
    title: 'Metadata Input',
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
        {schemas?.map(({ title, name, schema }) => {
          const jsonSchema = zodToJsonSchema(schema, name)
          return (
            <Tab.Panel key={name}>
              <DynamicForm
                key={name}
                title={title}
                schema={jsonSchema?.definitions[name]}
              />
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}
