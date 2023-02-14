import React from 'react'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { RiDeleteBack2Line as DeleteIcon } from 'react-icons/ri'
import { ComponentProps } from 'react'
import { Attribute, MetadataFormData } from '../utils'
import { LearnMoreAboutOpenseaMetadataLink } from './Item'
import { getURL } from '~/utils/url'
import { FiExternalLink } from 'react-icons/fi'

export function AddPropertyModal({
  isOpen,
  setIsOpen,
}: ComponentProps<typeof Modal>) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const {
    fields: properties,
    append: appendProperty,
    remove: removeProperty,
  } = useFieldArray({
    control,
    name: 'properties',
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <header className="space-y-2 text-brand-dark">
          <h3 className="text-xl font-bold"> Add Properties </h3>
          <p>
            Textual traits that show up as rectangles on OpenSea and other
            marketplaces.
          </p>
          <LearnMoreAboutOpenseaMetadataLink />
        </header>
        <div className="space-y-2">
          {properties.map((item, index) => (
            <div key={item.id} className="flex items-end w-full gap-2">
              <Input
                label="Type"
                type="text"
                placeholder="type"
                {...register(`properties.${index}.trait_type`)}
                error={errors?.properties?.[index]?.trait_type?.message}
              />
              <Input
                label="Value"
                type="text"
                placeholder="name"
                {...register(`properties.${index}.value`)}
                error={errors?.properties?.[index]?.value?.message}
              />
              <button
                className="mb-5 hover:fill-brand-ui-primary"
                aria-label="remove"
                onClick={(event) => {
                  event.preventDefault()
                  removeProperty(index)
                }}
              >
                <DeleteIcon size={24} className="fill-inherit" />
              </button>
            </div>
          ))}
          <Button
            onClick={(event) => {
              event.preventDefault()
              appendProperty({
                trait_type: '',
                value: '',
              })
            }}
            size="small"
            variant="outlined-primary"
          >
            Add property
          </Button>
        </div>
        <Button
          onClick={(event) => {
            event.preventDefault()
            setIsOpen(false)
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}

export function Property({ trait_type, value }: Attribute) {
  const link = getURL(value?.toString())
  return (
    <div className="flex flex-col items-center justify-center h-20 text-sm text-center border w-36 bg-ui-main-50 rounded-xl aspect-1 border-ui-main-300">
      <h4 className="text-sm"> {trait_type}</h4>
      <div className="w-32 overflow-hidden font-semibold line-clamp-1 overflow-ellipsis">
        {link ? (
          <a className="inline-flex items-center gap-2" href={link.toString()}>
            link <FiExternalLink />
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  )
}
