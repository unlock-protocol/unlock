import { Input, Checkbox } from '@unlock-protocol/ui'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import parseSchema from '~/utils/parseEasSchema'

interface DynamicFormForAttestationsProps {
  schema: string // Raw schema string like "string firstName,string lastName,uint256 age"
  register: UseFormRegister<Record<string, unknown>> // Passed from parent form
  errors?: FieldErrors<Record<string, unknown>>
}

// Map EAS types to HTML input types
// WARNING: since the EAS schemas don't support date object, every date field is configured as a number
// This is why when, in the EAS schema, when a field is of a "number" type, we interpret it as a date.

const getInputType = (easType: string): string => {
  if (easType.startsWith('uint') || easType.startsWith('int')) {
    return 'date'
  }
  if (easType === 'bool') {
    return 'checkbox'
  }
  if (easType === 'address') {
    return 'text'
  }
  // string, bytes, bytes32, etc. -> text
  return 'text'
}

// Render a single field based on its type
const renderField = (
  field: { type: string; name: string; displayName: string },
  register: UseFormRegister<Record<string, unknown>>,
  errors?: FieldErrors<Record<string, unknown>>
) => {
  const inputType = getInputType(field.type)
  const errorMessage = errors?.[field.name]
    ? `${field.displayName} is required`
    : undefined

  if (inputType === 'checkbox') {
    return (
      <Checkbox
        key={field.name}
        label={field.displayName}
        {...register(field.name, { required: true })}
      />
    )
  }

  return (
    <Input
      key={field.name}
      label={field.displayName}
      placeholder={`Enter ${field.displayName}`}
      type={inputType}
      error={errorMessage}
      {...register(field.name, {
        required: true,
        ...(inputType === 'number' && { valueAsNumber: true }),
      })}
    />
  )
}

const DynamicFormForAttestations = ({
  schema,
  register,
  errors,
}: DynamicFormForAttestationsProps) => {
  const parsedSchema = parseSchema(schema)

  return (
    <div>
      <h3 className="text-base font-semibold mb-4">Attestation data</h3>
      <div className="flex flex-col gap-4">
        {parsedSchema.map((field) => renderField(field, register, errors))}
      </div>
    </div>
  )
}

export default DynamicFormForAttestations
