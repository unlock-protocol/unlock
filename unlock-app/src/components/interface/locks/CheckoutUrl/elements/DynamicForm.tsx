import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { component } from '~/propTypes'
import { z } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useState } from 'react'

const DESCRIPTIONS: Record<string, string> = {
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
}
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

export const DynamicForm = ({
  name,
  schema,
  onChange,
  submitLabel = 'Next',
  description = {},
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
    <div className="flex flex-col gap-3 py-6">
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
