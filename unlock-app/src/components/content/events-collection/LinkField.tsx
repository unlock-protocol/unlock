'use client'

import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, Input, Select } from '@unlock-protocol/ui'
import { FiTrash as TrashIcon } from 'react-icons/fi'
import { NewEventCollectionForm } from './Form'

interface LinkFieldProps {
  index: number
  remove: (index: number) => void
  showRemove?: boolean
}

const linkTypes = [
  { value: 'website', label: 'Website' },
  { value: 'farcaster', label: 'Farcaster' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
]

const LinkField: React.FC<LinkFieldProps> = ({
  index,
  remove,
  showRemove = true,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<NewEventCollectionForm>()

  const linkType = watch(`links.${index}.type`)

  return (
    <div className="flex flex-col md:flex-row items-start gap-4 w-full">
      {/* Link Type Selector */}
      <div className="flex-grow md:flex-grow-0 md:w-1/4">
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
      </div>

      {/* Link URL Input */}
      <div className="flex-grow min-h-[4rem]">
        {' '}
        {/* Added min-h for consistency */}
        <Controller
          control={control}
          name={`links.${index}.url`}
          rules={{
            required: 'URL or handle is required',
            validate: (value) => {
              if (linkType === 'website') {
                const regex = /^https?:\/\/.+\..+/
                return regex.test(value) || 'Invalid URL format for website'
              }
              return value.trim() !== '' || 'URL or handle cannot be empty'
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              className="w-full"
              error={errors.links && errors.links[index]?.url?.message}
              placeholder={
                linkType === 'website'
                  ? 'https://example.com'
                  : 'Your handle or URL'
              }
            />
          )}
        />
      </div>

      {/* Remove Button */}
      {showRemove && (
        <div className="flex items-center">
          <Button
            variant="borderless"
            aria-label="Remove link"
            onClick={() => remove(index)}
          >
            <TrashIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

export default LinkField
