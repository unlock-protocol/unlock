import React from 'react'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { RiDeleteBack2Line as DeleteIcon } from 'react-icons/ri'
import { ComponentProps } from 'react'
import { Attribute, MetadataFormData } from '../utils'
import { LearnMoreAboutOpenseaMetadataLink } from './Item'

export function AddLevelModal({
  isOpen,
  setIsOpen,
}: ComponentProps<typeof Modal>) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const {
    fields: levels,
    append: appendLevel,
    remove: removeLevel,
  } = useFieldArray({
    control,
    name: 'levels',
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <header className="space-y-2 text-brand-dark">
          <h3 className="text-xl font-bold"> Add Levels </h3>
          <p>
            Numerical traits that show as a progress bar on OpenSea and other
            marketplaces
          </p>
          <LearnMoreAboutOpenseaMetadataLink />
        </header>
        <div className="space-y-2">
          {levels.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-end w-full gap-2">
                <Input
                  label="Type"
                  type="text"
                  placeholder="type"
                  error={errors?.levels?.[index]?.trait_type?.message}
                  {...register(`levels.${index}.trait_type`)}
                />
                <div className="space-y-1 max-w-[50%] mb-1.5">
                  <label htmlFor="value"> Value </label>
                  <div className="grid items-center grid-cols-3 px-2 border border-gray-400 rounded-lg">
                    <input
                      type="number"
                      pattern="^[0-9]"
                      {...register(`levels.${index}.value`, {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
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
                      type="number"
                      pattern="^[0-9]"
                      {...register(`levels.${index}.max_value`, {
                        valueAsNumber: true,
                      })}
                      id="of"
                      placeholder="100"
                      className="box-border flex-1 block w-full p-2 text-base border-none outline-none"
                    />
                  </div>
                </div>
                <button
                  className="mb-5 hover:fill-brand-ui-primary"
                  aria-label="remove"
                  onClick={(event) => {
                    event.preventDefault()
                    removeLevel(index)
                  }}
                >
                  <DeleteIcon size={24} className="fill-inherit" />
                </button>
              </div>
            </div>
          ))}
          <Button
            onClick={(event) => {
              event.preventDefault()
              appendLevel({
                trait_type: '',
                value: 75,
                max_value: 100,
              })
            }}
            size="small"
            variant="outlined-primary"
          >
            Add level
          </Button>
        </div>
        <Button
          disabled={!!errors.levels?.length}
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

export function Level({ trait_type, max_value = 100, value = 50 }: Attribute) {
  let width = Math.floor((Number(value) / max_value) * 100)
  width = width > 100 ? 100 : width

  return (
    <div className="flex flex-col w-56 gap-2 px-4 py-2 text-sm border rounded-lg text-brand-dark border-ui-main-500">
      <div className="flex items-center justify-between ">
        <div>{trait_type}</div>
        <div>
          {value} of {max_value}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full">
        <div
          className="p-1 text-sm font-medium leading-none text-center text-blue-100 rounded-full bg-ui-main-900"
          style={{
            width: `${width}%`,
          }}
        >
          {value}%
        </div>
      </div>
    </div>
  )
}
