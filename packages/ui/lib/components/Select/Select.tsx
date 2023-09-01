import { Listbox } from '@headlessui/react'
import { ReactNode, useEffect, useState } from 'react'
import { BsCheck as CheckIcon } from 'react-icons/bs'
import { MdOutlineKeyboardArrowDown as ArrowDownIcon } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import { Size, SizeStyleProp } from '~/types'
import { Button } from '../Button/Button'
import { FieldLayout, Input } from '../Form'
import { Tooltip } from '../Tooltip/Tooltip'
import { HiQuestionMarkCircle as QuestionMark } from 'react-icons/hi'
import { Placeholder } from '../Placeholder'
export interface Option {
  label: string
  value: string | number
  append?: React.ReactNode // element to add at the end of the select
  prepend?: React.ReactNode // element to add before the label
  disabled?: boolean
}

export interface SelectProps<T> {
  label?: string
  description?: ReactNode
  tooltip?: ReactNode
  options: Option[]
  size?: Size
  onChange?: (value: string | number, isCustom?: boolean) => void
  defaultValue?: T
  customOption?: boolean // show custom option that will show a custom input
  disabled?: boolean
  loading?: boolean
}

const SIZE_STYLES: SizeStyleProp = {
  tiny: 'p-1 text-sm',
  small: 'px-2.5 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-4 py-2.5',
}

const CUSTOM_VALUE = 'custom'

export interface SelectOptionProps {
  selected?: boolean
  disabled?: boolean
  size?: Size
  option: Option
  hasAnyAppend?: boolean
  hasAnyPrepend?: boolean
}

const SelectOption = ({
  selected,
  disabled,
  size = 'medium',
  option,
  hasAnyAppend,
  hasAnyPrepend,
}: SelectOptionProps) => {
  const { append = null, prepend = null } = option ?? {}

  const inputSizeStyle = SIZE_STYLES[size]

  const optionClass = twMerge(
    `${selected ? 'bg-gray-100' : ''} ${
      disabled ? 'opacity-40' : 'hover:bg-gray-100'
    } flex items-center justify-between p-3`,
    inputSizeStyle
  )

  return (
    <div className={optionClass}>
      <div
        className={
          hasAnyPrepend ? 'grid items-center grid-cols-[auto_1fr] gap-2' : ''
        }
      >
        {prepend && <div>{prepend}</div>}
        <span className={selected ? 'font-bold' : ''}>{option.label}</span>
      </div>
      <div
        className={
          hasAnyAppend ? 'grid items-center grid-cols-[1fr_14px] gap-2' : ''
        }
      >
        {append && <div>{append}</div>}
        {selected && <CheckIcon size={20} />}
      </div>
    </div>
  )
}

export const Select = <T extends unknown>({
  options,
  onChange,
  label = '',
  tooltip = '',
  description = '',
  size = 'medium',
  defaultValue,
  customOption = false,
  disabled: fieldDisabled = false,
  loading = false,
}: SelectProps<T>) => {
  const [selected, setSelected] = useState<Option | null>(null)
  const [custom, setCustom] = useState<boolean>(false) // value that enables/disable custom field
  const [customValue, setCustomValue] = useState('')
  const [enableCustomConfirm, setEnableCustomConfirm] = useState(false)

  const onChangeOption = (value: Option['value']) => {
    if (CUSTOM_VALUE !== value) {
      const currentItem = options?.find((option) => option.value == value)
      setSelected(currentItem || null)
      if (currentItem && typeof onChange === 'function') {
        onChange(currentItem?.value, false)
      }
    } else {
      setCustom(true)
      // reset value when custom value is selected
      if (typeof onChange === 'function') {
        onChange('', true)
      }
    }
  }

  const onChangeCustomValue = () => {
    setCustomValue(customValue)
    if (customValue && typeof onChange === 'function') {
      onChange(customValue, custom)
      setEnableCustomConfirm(false)
    }
  }

  const onCustomInputChange = (e: any) => {
    setCustomValue(e?.target?.value ?? '')
    setEnableCustomConfirm(true)
  }

  const inputSizeStyle = SIZE_STYLES[size]

  const inputClass = twMerge(
    'box-border flex-1 block w-full text-base text-left transition-all bg-white border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none',
    fieldDisabled ? 'opacity-50' : '',
    inputSizeStyle
  )

  // Set default value if present
  useEffect(() => {
    if (loading) return
    if (defaultValue && selected?.value) return

    onChangeOption(defaultValue as string)
  }, [defaultValue, loading, selected])

  const disableConfirm = customValue?.length === 0 || !enableCustomConfirm

  if (loading) {
    return <Placeholder.Line size="xl" />
  }

  return (
    <FieldLayout
      size={size}
      description={description}
      append={
        custom && (
          <>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setCustom(!custom)
                  setCustomValue('')
                  setSelected(null)
                }}
                variant="outlined-primary"
                size="tiny"
              >
                Select from list
              </Button>
              <Button
                onClick={onChangeCustomValue}
                size="tiny"
                disabled={disableConfirm}
              >
                Confirm
              </Button>
            </div>
          </>
        )
      }
    >
      <Listbox
        disabled={fieldDisabled}
        value={selected?.value || ''}
        onChange={onChangeOption}
      >
        <div className="relative">
          {label?.length > 0 && (
            <label className="block px-1 mb-1 text-base" htmlFor="">
              {tooltip && (
                <Tooltip delay={0} tip={tooltip} side="top" theme="dark">
                  <span>
                    {label} <QuestionMark className="inline" />
                  </span>
                </Tooltip>
              )}
              {!tooltip && <span>{label}</span>}
            </label>
          )}
          {custom ? (
            <Input onChange={onCustomInputChange} />
          ) : (
            <>
              <Listbox.Button className={inputClass}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selected?.prepend && <div>{selected.prepend}</div>}
                    <span>{selected?.label || 'Choose option'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected?.append && <div>{selected.append}</div>}
                    <ArrowDownIcon size={20} />
                  </div>
                </div>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 w-full mt-1 overflow-scroll bg-white border border-gray-400 rounded-xl max-h-[300px] outline-none">
                {options?.map((option: Option) => {
                  const hasAnyAppend = options?.some((option) => option.append)
                  const hasAnyPrepend = options?.some(
                    (option) => option.prepend
                  )
                  const disabled = (option?.disabled || fieldDisabled) ?? false

                  return (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      className={disabled ? '' : 'cursor-pointer'}
                      disabled={disabled}
                    >
                      {({ selected }) => {
                        return (
                          <SelectOption
                            hasAnyAppend={hasAnyAppend}
                            hasAnyPrepend={hasAnyPrepend}
                            option={option}
                            disabled={disabled}
                            selected={selected}
                          />
                        )
                      }}
                    </Listbox.Option>
                  )
                })}
                {customOption && (
                  <Listbox.Option
                    className={fieldDisabled ? '' : 'cursor-pointer'}
                    value={CUSTOM_VALUE}
                    disabled={fieldDisabled}
                  >
                    <SelectOption
                      option={{ label: 'Other', value: CUSTOM_VALUE }}
                      disabled={fieldDisabled}
                    />
                  </Listbox.Option>
                )}
              </Listbox.Options>
            </>
          )}
        </div>
      </Listbox>
    </FieldLayout>
  )
}
