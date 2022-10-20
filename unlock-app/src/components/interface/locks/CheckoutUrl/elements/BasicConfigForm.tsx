import { BasicPaywallConfig, BasicPaywallConfigSchema } from '~/unlockTypes'
import { DynamicForm } from './DynamicForm'

interface BasicConfigFormProps {
  onChange: (fields: BasicPaywallConfig) => void
  defaultValues?: any
}

const HeaderSchema = BasicPaywallConfigSchema.pick({
  title: true,
  icon: true,
})

const AdditionalBehaviorSchema = BasicPaywallConfigSchema.omit({
  title: true,
  icon: true,
})

export const BasicConfigForm = ({
  onChange,
  defaultValues,
}: BasicConfigFormProps) => {
  const onSubmit = () => {}

  return (
    <>
      <div>
        <DynamicForm
          name={'locks'}
          title="Headers"
          schema={HeaderSchema}
          onChange={onChange}
          onSubmit={onSubmit}
          submitLabel={'Add lock'}
          defaultValues={defaultValues}
        />
      </div>
      <div>
        <DynamicForm
          title="Additional Behavior"
          name={'locks'}
          schema={AdditionalBehaviorSchema}
          onChange={onChange}
          onSubmit={onSubmit}
          submitLabel={'Add lock'}
          defaultValues={defaultValues}
        />
      </div>
    </>
  )
}
