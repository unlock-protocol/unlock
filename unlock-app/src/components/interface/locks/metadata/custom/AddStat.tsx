import React from 'react'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { RiDeleteBack2Line as DeleteIcon } from 'react-icons/ri'
import { ComponentProps } from 'react'
import { Attribute, MetadataFormData } from '../utils'
import { LearnMoreAboutOpenseaMetadataLink } from './Item'

export function AddStatModal({
  isOpen,
  setIsOpen,
}: ComponentProps<typeof Modal>) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const {
    fields: stats,
    append: appendStat,
    remove: removeStat,
  } = useFieldArray({
    control,
    name: 'stats',
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <header className="space-y-2 text-brand-dark">
          <h3 className="text-xl font-bold">Add Stats </h3>
          <p>Numerical traits that just show as numbers.</p>
          <LearnMoreAboutOpenseaMetadataLink />
        </header>
        <div className="space-y-2">
          {stats.map((item, index) => (
            <div key={item.id} className="flex items-end w-full gap-2">
              <Input
                label="Type"
                type="text"
                placeholder="type"
                error={errors?.stats?.[index]?.trait_type?.message}
                {...register(`stats.${index}.trait_type`)}
              />
              <div className="space-y-1 max-w-[50%] mb-1.5">
                <label htmlFor="value"> Value </label>
                <div className="grid items-center grid-cols-3 px-2 border border-gray-400 rounded-lg">
                  <input
                    type="number"
                    placeholder="0"
                    pattern="^[0-9]"
                    {...register(`stats.${index}.value`, {
                      valueAsNumber: true,
                    })}
                    id="value"
                    className="box-border flex-1 block w-full p-2 text-base border-none outline-none focus:outline-none"
                  />
                  <label
                    htmlFor="of"
                    className="flex items-center justify-center h-full bg-gray-100"
                  >
                    of
                  </label>
                  <input
                    id="of"
                    type="number"
                    placeholder="100"
                    pattern="^[0-9]"
                    {...register(`stats.${index}.max_value`, {
                      valueAsNumber: true,
                    })}
                    className="box-border flex-1 block w-full p-2 text-base border-none outline-none"
                  />
                </div>
              </div>
              <button
                className="mb-5 hover:fill-brand-ui-primary"
                aria-label="remove"
                onClick={(event) => {
                  event.preventDefault()
                  removeStat(index)
                }}
              >
                <DeleteIcon size={24} className="fill-inherit" />
              </button>
            </div>
          ))}
          <Button
            onClick={(event) => {
              event.preventDefault()
              appendStat({
                display_type: 'number',
                trait_type: '',
                value: 1,
                max_value: 10,
              })
            }}
            size="small"
            variant="outlined-primary"
          >
            Add Stat
          </Button>
        </div>
        <Button
          disabled={!!errors.stats?.length}
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

export function Stat({ trait_type, max_value, value }: Attribute) {
  return (
    <div className="flex items-center justify-between w-56 px-4 py-2 text-sm border rounded-lg border-ui-main-500">
      <div>{trait_type}</div>
      <div>
        {value} of {max_value}
      </div>
    </div>
  )
}
