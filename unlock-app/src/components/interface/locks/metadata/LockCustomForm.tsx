import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { Disclosure } from '@headlessui/react'
import {
  RiArrowDropUpLine as UpIcon,
  RiArrowDropDownLine as DownIcon,
  RiDeleteBack2Line as DeleteIcon,
  RiAddLine as AddIcon,
} from 'react-icons/ri'
import { useEffect, useState } from 'react'
export interface Props {
  disabled?: boolean
}

export function LockCustomForm() {
  const { control, register, getValues } = useFormContext<{
    properties: Record<string, string | null>[]
  }>()

  const items = useWatch({
    control,
    name: 'properties',
    defaultValue: getValues('properties'),
  })

  const [addProperties, setAddProperties] = useState(false)
  const {
    fields: properties,
    append: appendProperty,
    remove: removeProperty,
  } = useFieldArray({
    control,
    name: 'properties',
  })

  useEffect(() => {
    if (properties.length < 1) {
      appendProperty({
        name: null,
        type: null,
      })
    }
  }, [appendProperty, properties])

  return (
    <div>
      <Modal isOpen={addProperties} setIsOpen={setAddProperties}>
        <div className="grid gap-6">
          <div className="space-y-2">
            {properties.map((item, index) => (
              <div key={item.id} className="flex items-end w-full gap-2">
                <Input
                  label="Type"
                  type="text"
                  placeholder="type"
                  {...register(`properties.${index}.type`)}
                />
                <Input
                  label="Name"
                  type="text"
                  placeholder="name"
                  {...register(`properties.${index}.name`)}
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
                  type: '',
                  name: '',
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
              setAddProperties(false)
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
      <div className="p-6 bg-white shadow border-xs rounded-xl">
        <Disclosure defaultOpen>
          {({ open }) => (
            <div>
              <Disclosure.Button className="flex items-center justify-between w-full mb-2">
                <h3 className="text-lg font-bold text-brand-ui-primary">
                  Custom
                </h3>
                <div>
                  {open ? (
                    <UpIcon className="fill-brand-ui-primary" size={24} />
                  ) : (
                    <DownIcon className="fill-brand-ui-primary" size={24} />
                  )}
                </div>
              </Disclosure.Button>
              <Disclosure.Panel className="space-y-6">
                <div className="py-6 border-b border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">Properties</h3>
                      <p className="text-sm text-gray-700">
                        Custom attribute that will display as text & as
                        rectangles in Opensea{' '}
                      </p>
                    </div>
                    <button
                      className="p-2 border rounded-full border-brand-ui-primary"
                      aria-label="Add Property"
                      onClick={(event) => {
                        event.preventDefault()
                        setAddProperties(true)
                      }}
                    >
                      <AddIcon className="fill-brand-ui-primary" size={24} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-6">
                    {items
                      .filter((item) => item.type && item.name)
                      .map((item) => (
                        <div
                          className="flex flex-col items-center justify-center w-40 h-40 p-4 border rounded-xl aspect-1"
                          key={item.id}
                        >
                          <h4 className="text-lg font-bold"> {item.type}</h4>
                          <p>{item.name}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>
    </div>
  )
}
