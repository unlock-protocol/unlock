import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
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
    schema: z.object({
      name: z.string(),
      defaultValue: z.string().optional(),
      type: z.enum(['text', 'date', 'color', 'email', 'url']),
      required: z.boolean(),
      placeholder: z.string().optional(),
      public: z.boolean().optional(), // optional, all non-public fields are treated as protected
    }),
  },
]

export const CheckoutForm = () => {
  return (
    <div>
      {schemas?.map(({ title, name, schema }) => {
        const jsonSchema = zodToJsonSchema(schema, name)
        return (
          <DynamicForm
            key={name}
            title={title}
            schema={jsonSchema?.definitions[name]}
          />
        )
      })}
    </div>
  )
}
