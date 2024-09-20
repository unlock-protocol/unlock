import { Controller, useFormContext } from 'react-hook-form'
import { Select, Button, Input } from '@unlock-protocol/ui'
import { FiTrash as TrashIcon } from 'react-icons/fi'
import { NewEventCollectionForm } from './Form'

interface LinkFieldProps {
  index: number
  remove: (index: number) => void
}

const linkTypes = [
  { value: 'website', label: 'Website' },
  { value: 'farcaster', label: 'Farcaster' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
]

const LinkField: React.FC<LinkFieldProps> = ({ index, remove }) => {
  const {
    control,
    watch,
    register,
    formState: { errors },
  } = useFormContext<NewEventCollectionForm>()
  const linkType = watch(`links.${index}.type`)

  return (
    <div className="flex items-center gap-4 w-full">
      <Controller
        control={control}
        name={`links.${index}.type`}
        rules={{ required: 'Link type is required' }}
        render={({ field }) => (
          <Select
            value={field.value || 'website'}
            onChange={(val) => field.onChange(val)}
            options={linkTypes}
          />
        )}
      />
      {errors.links && errors.links[index]?.type && (
        <p className="text-red-500 text-sm">
          {errors.links[index].type &&
          typeof errors.links[index].type === 'object' &&
          'message' in errors.links[index].type
            ? errors.links[index].type.message
            : 'Invalid link type'}
        </p>
      )}
      <Input
        {...register(`links.${index}.url`, {
          required: 'URL or handle is required',
          validate: (value) => {
            if (linkType === 'website') {
              const regex = /^https?:\/\/.+\..+/
              return regex.test(value) || 'Invalid URL format for website'
            }
            return value.trim() !== '' || 'URL or handle cannot be empty'
          },
        })}
        type="text"
        className="w-full"
        placeholder={
          linkType === 'website' ? 'https://example.com' : 'Your handle or URL'
        }
      />
      {errors.links && errors.links[index]?.url && (
        <p className="text-red-500 text-sm">
          {errors.links[index].url &&
          typeof errors.links[index].url === 'object' &&
          'message' in errors.links[index].url
            ? errors.links[index].url.message
            : 'Invalid URL'}
        </p>
      )}
      <Button
        variant="borderless"
        aria-label="Remove link"
        onClick={() => remove(index)}
      >
        <TrashIcon />
      </Button>
    </div>
  )
}

export default LinkField
