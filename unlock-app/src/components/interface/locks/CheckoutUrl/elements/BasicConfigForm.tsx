import { BasicPaywallConfig, BasicPaywallConfigSchema } from '~/unlockTypes'
import { DynamicForm } from './DynamicForm'

interface BasicConfigFormProps {
  onChange: (fields: BasicPaywallConfig) => void
  defaultValues?: any
}
export const BasicConfigForm = ({
  onChange,
  defaultValues,
}: BasicConfigFormProps) => {
  const onSubmit = () => {}

  return (
    <DynamicForm
      name={'locks'}
      schema={BasicPaywallConfigSchema}
      onChange={onChange}
      onSubmit={onSubmit}
      submitLabel={'Add lock'}
      defaultValues={defaultValues}
    />
  )
}
