import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { component } from '~/propTypes'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useState } from 'react'

interface DynamicFormProps {
  name: string
  schema: z.Schema
  title?: string
  description?: Record<string, string>
  onChange: (fields: any) => void
  onSubmit?: (fields: any) => void
  submitLabel?: string
  defaultValues?: any
  showSubmit?: boolean
}

interface ComponentByTypeMapProps {
  [type: string]: any
}

interface FieldProps {
  required?: boolean
  label?: string
  type: string
  name: string
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
            onChange={(isActive: boolean) => {
              setValue(name, isActive)
            }}
          />
        )}
      </ConnectForm>
    </div>
  )
}

const ObjectInput = () => {
  return <div></div>
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

const camelCaseToText = (text: string) => {
  return text.replace(/([A-Z](?=[a-z]+)|[A-Z]+(?![a-z]))/g, ' $1').trim()
}

export const DynamicForm = ({
  name,
  schema,
  onChange,
  submitLabel = 'Next',
  onSubmit: onSubmitCb,
  defaultValues,
  showSubmit = false,
  title,
}: DynamicFormProps) => {
  const { properties = {}, required = [] } =
    (zodToJsonSchema(schema, name).definitions?.[name] as any) ?? {}

  const methods = useForm<z.infer<typeof schema>>({
    mode: 'onChange',
    defaultValues,
  })

  const onSubmit = (fields: z.infer<typeof schema>) => {
    if (typeof onSubmitCb === 'function') {
      onSubmitCb(fields)
    }
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      <FormProvider {...methods}>
        {title && (
          <h2 className="mb-2 text-lg font-bold text-brand-ui-primary">
            {title}
          </h2>
        )}
        <form
          className="flex flex-col gap-3"
          onSubmit={methods.handleSubmit(onSubmit)}
          onChange={() => {
            onChange(methods.getValues())
          }}
        >
          {Object.entries(properties).map(([fieldName, props], index) => {
            const { type, description } = (props as any) ?? {}

            const Component = ComponentByTypeMap?.[type] ?? undefined
            const inputType: string = TypeMap?.[type] || type
            const fieldRequired = required.includes(fieldName)
            const label = fieldRequired ? `* ${fieldName}` : fieldName

            if (!component) return null
            return (
              <div className="flex flex-col gap-2" key={index}>
                <Component
                  props={props}
                  label={camelCaseToText(label)}
                  type={inputType}
                  name={fieldName}
                  required={fieldRequired}
                  description={description}
                  size="small"
                />
              </div>
            )
          })}
          {showSubmit && (
            <div className="flex mt-2">
              <div className="ml-auto">
                <Button type="submit">{submitLabel}</Button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  )
}
