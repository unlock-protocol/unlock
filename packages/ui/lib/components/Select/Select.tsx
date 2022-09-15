import { Listbox } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { BsCheck as CheckIcon } from 'react-icons/bs'
import { MdOutlineKeyboardArrowDown as ArrowDownIcon } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import { Size, SizeStyleProp } from '~/types'

export interface Option {
  label: string
  value: string | number
}

interface SelectProps<T> {
  label?: string
  options: Option[]
  size?: Size
  onChange?: (value: string | number) => void
  defaultValue?: T
}

const SIZE_STYLES: SizeStyleProp = {
  tiny: 'p-1 text-sm',
  small: 'px-2.5 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-4 py-2.5',
}

export const Select = <T extends unknown>({
  options,
  onChange,
  label = 'Select',
  size = 'medium',
  defaultValue,
}: SelectProps<T>) => {
  const [selected, setSelected] = useState<Option | null>(null)

  const onChangeOption = (value: Option['value']) => {
    const currentItem = options?.find((option) => option.value == value)
    setSelected(currentItem || null)
    if (currentItem && typeof onChange === 'function') {
      onChange(currentItem?.value)
    }
  }

  // Set default value if present
  useEffect(() => {
    if (!defaultValue) return
    const defaultSelection =
      options?.find((option) => option.value == `${defaultValue}`) || null
    setSelected(defaultSelection)
  }, [])

  const inputSizeStyle = SIZE_STYLES[size]

  const inputClass = twMerge(
    'box-border flex-1 block w-full text-base text-left transition-all bg-white border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none',
    inputSizeStyle
  )

  return (
    <Listbox value={selected?.value || ''} onChange={onChangeOption}>
      <div className="relative">
        {label?.length > 0 && (
          <label className="block px-1 mb-1 text-base" htmlFor="">
            {label}
          </label>
        )}
        <Listbox.Button className={inputClass}>
          <div className="flex items-center justify-between">
            <span>{selected?.label || 'Choose option'}</span>
            <ArrowDownIcon size={20} />
          </div>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-400 rounded-xl">
          {options?.map((option: Option) => {
            return (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                {({ selected }) => {
                  const optionClass = twMerge(
                    `${
                      selected ? 'bg-gray-100' : ''
                    } flex items-center justify-between p-3 hover:bg-gray-100`,
                    inputSizeStyle
                  )
                  return (
                    <div className={optionClass}>
                      <span className={selected ? 'font-bold' : ''}>
                        {option.label}
                      </span>
                      {selected && <CheckIcon size={20} />}
                    </div>
                  )
                }}
              </Listbox.Option>
            )
          })}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}
