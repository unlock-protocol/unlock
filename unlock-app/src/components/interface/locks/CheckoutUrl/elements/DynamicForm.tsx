import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { component } from '~/propTypes'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useState } from 'react'
interface DynamicFormProps {
  title: string
  name: string
  schema: z.Schema
  description?: Record<string, string>
}

interface ComponentByTypeMapProps {
  [type: string]: any
}

interface FieldProps {
  required?: boolean
  label?: string
  type: string
  name: string
  description?: string
  props: Record<string, any>
}

export const ConnectForm = ({ children }: any) => {
  const methods = useFormContext()

  return children({ ...methods })
}

const TextInput = ({ props, type, ...rest }: FieldProps) => {
  const { enum: enumList } = props
  const hasOptions = enumList?.length

  if (!hasOptions) {
    return (
      <ConnectForm>
        {({ register }: any) => <Input {...register(rest.name)} {...rest} />}
      </ConnectForm>
    )
  }

  const options = enumList.map((enumItem: string) => ({
    label: enumItem,
    value: enumItem,
  }))

  return <Select options={options} />
}

const BooleanInput = ({ props, name, label, ...rest }: any) => {
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="block gap-3 py-2">
      <ConnectForm>
        {({ register, setValue }: any) => (
          <ToggleSwitch
            title={label}
            enabled={enabled}
            setEnabled={setEnabled}
            {...rest}
            {...register(name)}
            onChange={(isActive) => {
              setValue(name, isActive)
            }}
          />
        )}
      </ConnectForm>
    </div>
  )
}

const ObjectInput = () => {
  return null
}

const ArrayInput = () => {
  return null
}

const ComponentByTypeMap: ComponentByTypeMapProps = {
  string: TextInput,
  integer: TextInput,
  boolean: BooleanInput,
  object: ObjectInput, // todo: add support for objects
  array: ArrayInput, // todo: add support for arrays
}

const TypeMap: Record<string, string> = {
  string: 'text',
  integer: 'number',
}

export const DynamicForm = ({
  title,
  name,
  schema,
  description = {},
}: DynamicFormProps) => {
  const { properties = {}, required = [] } =
    (zodToJsonSchema(schema, name).definitions?.[name] as any) ?? {}

  const methods = useForm<z.infer<typeof schema>>()

  const onSubmit = (fields: z.infer<typeof schema>) => {}

  return (
    <div className="flex flex-col gap-3 py-6 bg-white shadow-sm rounded-xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <FormProvider {...methods}>
        <form
          className="flex flex-col gap-5"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          {Object.entries(properties).map(([fieldName, props], index) => {
            const type = (props as any)?.type

            const Component = ComponentByTypeMap?.[type] ?? undefined
            const inputType: string = TypeMap?.[type] || type
            const fieldRequired = required.includes(fieldName)
            const label = fieldRequired ? `* ${fieldName}` : fieldName

            if (!component) return null
            return (
              <div className="flex flex-col gap-2" key={index}>
                <Component
                  props={props}
                  label={label}
                  type={inputType}
                  name={fieldName}
                  required={fieldRequired}
                  description={description?.[fieldName]}
                />
              </div>
            )
          })}
          <div className="flex mt-2">
            <div className="ml-auto">
              <Button type="submit">Next</Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
