import { useState, useRef, useEffect, ReactNode, useMemo } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import {
  FaCheck as CheckIcon,
  FaChevronDown as ChevronDownIcon,
  FaEllipsisH as MoreIcon,
} from 'react-icons/fa'
import clsx from 'clsx'
import { FieldLayout } from './FieldLayout'

interface Option {
  label: string
  value: number | string
  prepend?: ReactNode
  append?: ReactNode
  disabled?: boolean
}

interface ComboboxProps {
  options: Option[]
  moreOptions?: Option[]
  initialSelected?: Option
  onSelect: (selected: Option) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  description?: ReactNode
  disabled?: boolean
}

export function Combobox({
  options,
  moreOptions = [],
  initialSelected,
  onSelect,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  label = '',
  description = '',
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Option | undefined>(initialSelected)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const comboboxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<(HTMLLIElement | null)[]>([])

  // Combine and deduplicate options
  const allOptions = useMemo(() => {
    const uniqueOptions = new Map<string | number, Option>()
    options.forEach((option) => uniqueOptions.set(option.value, option))
    moreOptions.forEach((option) => {
      if (!uniqueOptions.has(option.value)) {
        uniqueOptions.set(option.value, option)
      }
    })
    return Array.from(uniqueOptions.values())
  }, [options, moreOptions])

  // Filter options based on search query
  const filteredOptions = useMemo(
    () =>
      query === ''
        ? allOptions
        : allOptions.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
          ),
    [query, allOptions]
  )

  // Determine which options to display based on showMoreOptions state and search query
  const displayedOptions = useMemo(() => {
    // When searching, show all filtered results
    if (query !== '') {
      return filteredOptions
    }
    // When not searching, respect showMoreOptions state
    if (showMoreOptions) {
      return filteredOptions
    }
    return filteredOptions.filter((option) =>
      options.some((initialOption) => initialOption.value === option.value)
    )
  }, [filteredOptions, showMoreOptions, options, query])

  const handleSelect = (value: Option) => {
    setSelected(value)
    onSelect(value)
    setIsOpen(false)
    setQuery('')
    setFocusedIndex(-1)
    setShowMoreOptions(false)
  }

  const handleShowMore = () => {
    setShowMoreOptions(true)
    setFocusedIndex(displayedOptions.length)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
        setShowMoreOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Focus the currently selected option
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < displayedOptions.length) {
      optionsRef.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, displayedOptions])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else if (focusedIndex >= 0) {
          if (focusedIndex === displayedOptions.length && !showMoreOptions) {
            handleShowMore()
          } else {
            handleSelect(displayedOptions[focusedIndex])
          }
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        }
        setFocusedIndex((prevIndex) =>
          Math.min(prevIndex + 1, displayedOptions.length - 1)
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0))
        break
      case 'Tab':
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          setShowMoreOptions(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        setShowMoreOptions(false)
        break
    }
  }

  return (
    <FieldLayout label={label} description={description}>
      <Popover className="relative w-full" ref={comboboxRef}>
        {() => (
          <>
            <PopoverButton
              className={clsx(
                'w-full rounded-lg border border-gray-400 hover:border-gray-500 focus-within:ring-gray-500 focus-within:border-gray-500 bg-white px-3 py-2 text-base text-gray-900',
                'focus:outline-none focus:ring-1',
                'flex items-center justify-between'
              )}
              onClick={() => setIsOpen(!isOpen)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            >
              <span className="truncate">
                {selected ? selected.label : placeholder}
              </span>
              <ChevronDownIcon className="size-3 text-gray-900" />
            </PopoverButton>

            <Transition
              show={isOpen}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <PopoverPanel
                static
                className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg"
              >
                <div className="p-2">
                  <input
                    ref={inputRef}
                    className={clsx(
                      'w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-base text-gray-900',
                      'focus:outline-none focus:ring-1 focus:ring-brand-ui-primary focus:border-brand-ui-primary'
                    )}
                    placeholder={searchPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <ul className="max-h-60 overflow-auto py-1" role="listbox">
                  {displayedOptions.length > 0 ? (
                    <>
                      {displayedOptions.map((option, index) => (
                        <li
                          key={`${option.value}-${index}`}
                          ref={(el) => (optionsRef.current[index] = el)}
                          className={clsx(
                            'flex cursor-pointer mx-2 rounded-sm items-center gap-2 py-2 px-3 text-base',
                            'hover:bg-ui-main-50',
                            focusedIndex === index && 'bg-ui-main-50'
                          )}
                          onClick={() => handleSelect(option)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSelect(option)
                            } else {
                              handleKeyDown(e)
                            }
                          }}
                          role="option"
                          tabIndex={focusedIndex === index ? 0 : -1}
                          aria-selected={selected?.value === option.value}
                        >
                          <CheckIcon
                            className={clsx(
                              'size-3 text-brand-ui-primary',
                              selected?.value === option.value
                                ? 'visible'
                                : 'invisible'
                            )}
                          />
                          {option.label}
                        </li>
                      ))}
                      {/* Show "More options" button only when not searching and there are more options available */}
                      {!showMoreOptions &&
                        query === '' &&
                        moreOptions.length > 0 && (
                          <li
                            ref={(el) =>
                              (optionsRef.current[displayedOptions.length] = el)
                            }
                            className={clsx(
                              'flex cursor-pointer mx-2 rounded-sm items-center justify-center gap-2 py-3 px-3 text-base font-semibold',
                              'hover:bg-ui-main-50 text-brand-ui-primary',
                              'border-t border-gray-200',
                              focusedIndex === displayedOptions.length &&
                                'bg-ui-main-50'
                            )}
                            onClick={handleShowMore}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleShowMore()
                              } else {
                                handleKeyDown(e)
                              }
                            }}
                            role="option"
                            tabIndex={
                              focusedIndex === displayedOptions.length ? 0 : -1
                            }
                          >
                            <MoreIcon className="size-4" />
                            More options
                          </li>
                        )}
                    </>
                  ) : (
                    <li className="px-3 py-2 text-base text-gray-500">
                      No options found.
                    </li>
                  )}
                </ul>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </FieldLayout>
  )
}
