import { useFormContext, useWatch } from 'react-hook-form'
import { Disclosure } from '@unlock-protocol/ui'
import { RiAddLine as AddIcon } from 'react-icons/ri'
import { useState } from 'react'
import { MetadataFormData } from '../utils'
import { AddPropertyModal, Property } from './AddProperty'
import { AddLevelModal, Level } from './AddLevel'
import { AddStatModal, Stat } from './AddStat'

export interface Props {
  disabled?: boolean
}

export function LockCustomForm() {
  const { control, getValues } = useFormContext<MetadataFormData>()
  const [addProperties, setAddProperties] = useState(false)
  const [addStats, setAddStats] = useState(false)
  const [addLevels, setAddLevels] = useState(false)

  const properties = useWatch({
    control,
    name: 'properties',
    defaultValue: getValues('properties'),
  })

  const levels = useWatch({
    control,
    name: 'levels',
    defaultValue: getValues('levels'),
  })

  const stats = useWatch({
    control,
    name: 'stats',
    defaultValue: getValues('stats'),
  })

  return (
    <div>
      <AddPropertyModal isOpen={addProperties} setIsOpen={setAddProperties} />
      <AddLevelModal isOpen={addLevels} setIsOpen={setAddLevels} />
      <AddStatModal isOpen={addStats} setIsOpen={setAddStats} />
      <Disclosure label="Custom">
        <div className="space-y-6">
          <div className="py-2 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Properties</h3>
                <p className="text-sm text-gray-700">
                  Custom attribute that will display as text and rectangles on
                  NFT market places.
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
              {properties
                ?.filter((item) => item.trait_type && item.value)
                .map((item, index) => <Property {...item} key={index} />)}
            </div>
          </div>
          <div className="py-2 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Levels</h3>
                <p className="text-sm text-gray-700">
                  Numerical attribute that will display as progress bar.
                </p>
              </div>
              <button
                className="p-2 border rounded-full border-brand-ui-primary"
                aria-label="Add Property"
                onClick={(event) => {
                  event.preventDefault()
                  setAddLevels(true)
                }}
              >
                <AddIcon className="fill-brand-ui-primary" size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-6 mt-6">
              {levels
                ?.filter(
                  (item) => item.trait_type && item.value && item.max_value
                )
                .map((item, index) => <Level {...item} key={index} />)}
            </div>
          </div>
          <div className="py-2 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Stats</h3>
                <p className="text-sm text-gray-700">
                  Custom attribute that will display as numbers.
                </p>
              </div>
              <button
                className="p-2 border rounded-full border-brand-ui-primary"
                aria-label="Add Property"
                onClick={(event) => {
                  event.preventDefault()
                  setAddStats(true)
                }}
              >
                <AddIcon className="fill-brand-ui-primary" size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-6 mt-6">
              {stats
                ?.filter(
                  (item) => item.trait_type && item.value && item.max_value
                )
                .map((item, index) => <Stat {...item} key={index} />)}
            </div>
          </div>
        </div>
      </Disclosure>
    </div>
  )
}
