import { Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { component } from '~/propTypes'

interface DynamicFormProps {
  title: string
  schema: any
}

interface ComponentByTypeMapProps {
  [type: string]: any
}

const String = ({ props, ...rest }: any) => {
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

const Boolean = ({ props, ...rest }: any) => {
  return (
    <div className="flex items-center gap-3 ">
      <ToggleSwitch title={rest.label} {...rest} />
    </div>
  )
}

const ComponentByTypeMap: ComponentByTypeMapProps = {
  string: String,
  boolean: Boolean,
}

export const DynamicForm = ({ title, schema }: DynamicFormProps) => {
  console.log('dynamic form schema', schema)
  console.log(Object.entries(schema?.properties))

  const { register } = useForm({
    defaultValues: {},
  })

  return (
    <div className="flex flex-col gap-3 px-4 py-6 bg-white shadow-sm rounded-xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-5">
        {Object.entries(schema?.properties ?? {}).map(
          ([title, props], index) => {
            const type = (props as any)?.type
            const Component = ComponentByTypeMap?.[type] ?? undefined

            //console.log(title, type)
            if (!component) return null
            return (
              <div key={index}>
                <Component props={props} label={title} />
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
