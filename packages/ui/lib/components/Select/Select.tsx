import { Listbox } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { BsCheck as CheckIcon } from 'react-icons/bs'

export interface Option {
  label: string
  value: string | number
}

interface SelectProps {
  label?: string
  options: Option[]
  onChange?: (option: Option) => void
  defaultValue?: string | number
}

export const Select = ({
  options,
  onChange,
  label = 'Select',
  defaultValue,
}: SelectProps) => {
  const [selected, setSelected] = useState<Option | null>(null)

  const onChangeOption = (value: Option['value']) => {
    const currentItem = options?.find((option) => option.value == value)
    setSelected(currentItem || null)
    if (currentItem && typeof onChange === 'function') {
      onChange(currentItem)
    }
  }

  // Set default value if present
  useEffect(() => {
    if (!defaultValue) return
    const defaultSelection =
      options?.find((option) => option.value == defaultValue) || null
    setSelected(defaultSelection)
  }, [])

  return (
    <Listbox value={selected?.value || ''} onChange={onChangeOption}>
      <div className="relative">
        <label className="block px-1 mb-1 text-base" htmlFor="">
          {label}
        </label>
        <Listbox.Button className="box-border flex-1 block w-full py-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none">
          {selected?.label || 'Choose option'}
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-400 rounded-xl">
          {options?.map((option: Option) => {
            return (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                {({ selected }) => (
                  <div
                    className={`${
                      selected ? 'bg-gray-100' : ''
                    } flex items-center justify-between p-3 hover:bg-gray-100`}
                  >
                    <span className={selected ? 'font-bold' : ''}>
                      {option.label}
                    </span>
                    {selected && <CheckIcon size={20} />}
                  </div>
                )}
              </Listbox.Option>
            )
          })}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}
