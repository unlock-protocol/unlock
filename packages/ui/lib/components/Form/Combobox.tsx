import { useState, useRef, useEffect, ReactNode } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import {
  FaCheck as CheckIcon,
  FaChevronDown as ChevronDownIcon,
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
  const comboboxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<(HTMLLIElement | null)[]>([])

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          return option.label.toLowerCase().includes(query.toLowerCase())
        })

  const uniqueFilteredOptions = filteredOptions.filter(
    (option, index, self) =>
      index === self.findIndex((t) => t.value === option.value)
  )

  /**
   * Handles the selection of an option.
   * Updates the selected state, invokes the onSelect callback,
   * closes the dropdown, and resets the search query and focused index.
   *
   * @param value - The option that was selected
   */
  const handleSelect = (value: Option) => {
    setSelected(value)
    onSelect(value)
    setIsOpen(false)
    setQuery('')
    setFocusedIndex(-1)
  }

  /**
   * Effect to handle clicks outside the combobox.
   * Closes the dropdown if a click occurs outside the combobox container.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  /**
   * Effect to focus the search input when the dropdown is opened.
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  /**
   * Effect to manage focus on options during keyboard navigation.
   * Ensures the focused option is scrolled into view and focused.
   */
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
      optionsRef.current[focusedIndex]?.focus()
    }
  }, [focusedIndex, filteredOptions])

  /**
   * Handles keyboard events for accessibility and navigation.
   * Supports Enter, ArrowDown, ArrowUp, Tab, and Escape keys.
   *
   * @param event - The keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else if (focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex])
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        }
        setFocusedIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredOptions.length - 1)
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
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
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
                  {uniqueFilteredOptions.length > 0 ? (
                    uniqueFilteredOptions.map((option, index) => (
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
                    ))
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
