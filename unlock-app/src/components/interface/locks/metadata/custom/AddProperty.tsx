import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { RiDeleteBack2Line as DeleteIcon } from 'react-icons/ri'
import { ComponentProps } from 'react'
import { Attribute, MetadataFormData } from '../utils'
import { LearnMoreAboutOpenseaMetadataLink } from './Item'

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
            marketplaces
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
  return (
    <div className="flex flex-col items-center justify-center w-40 h-20 border bg-ui-main-50 rounded-xl aspect-1 border-ui-main-300">
      <h4 className="text-sm"> {trait_type}</h4>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}
