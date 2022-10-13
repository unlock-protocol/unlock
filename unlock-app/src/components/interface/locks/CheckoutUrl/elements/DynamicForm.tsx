import { Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { component } from '~/propTypes'

interface DynamicFormProps {
  title: string
  schema: any
}

interface ComponentByTypeMapProps {
  [type: string]: any
}

const TextInput = ({ props, type, ...rest }: any) => {
  const { enum: enumList } = props
  const hasOptions = enumList?.length

  if (!hasOptions) {
    return <Input {...rest} />
  }

  const options = enumList.map((enumItem: string) => ({
    label: enumItem,
    value: enumItem,
  }))

  return <Select options={options} />
}

const BooleanInput = ({ props, ...rest }: any) => {
  return (
    <div className="flex items-center gap-3 ">
      <ToggleSwitch title={rest.label} {...rest} />
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

export const DynamicForm = ({ title, schema }: DynamicFormProps) => {
  return (
    <div className="flex flex-col gap-3 px-4 py-6 bg-white shadow-sm rounded-xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-5">
        {Object.entries(schema?.properties ?? {}).map(
          ([title, props], index) => {
            const type = (props as any)?.type
            console.log(title, type, props)
            const Component = ComponentByTypeMap?.[type] ?? undefined
            const inputType: string = TypeMap?.[type] || type

            if (!component) return null
            return (
              <div key={index}>
                <Component props={props} label={title} type={inputType} />
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
