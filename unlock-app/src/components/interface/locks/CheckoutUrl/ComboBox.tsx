import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { FaCheck as CheckIcon, FaAngleDown as UpDownIcon } from 'react-icons/fa'
import { PaywallConfigType } from '@unlock-protocol/core'

export interface CheckoutConfig {
  id: string | null
  name: string
  config: PaywallConfigType
}

interface Props {
  items: CheckoutConfig[]
  onChange(config: CheckoutConfig): void
  value: CheckoutConfig
  disabled?: boolean
}

// TODO: Create reusable component if frequently used outside this
export default function ConfigComboBox({
  items,
  onChange,
  value,
  disabled,
}: Props) {
  const [query, setQuery] = useState('')

  const filteredItems =
    query === ''
      ? items
      : items.filter((item) =>
          item.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  return (
    <Combobox value={value} disabled={disabled} onChange={onChange}>
      <div className="relative z-10 mt-1">
        <div className="relative w-full overflow-hidden text-left bg-white border border-gray-400 rounded-lg cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2">
          <Combobox.Input
            className="w-full py-2 pl-3 pr-10 leading-5 text-gray-900 border-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-75"
            displayValue={(item: CheckoutConfig) => item.name}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <UpDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base">
            {query.length > 0 && filteredItems.length <= 0 && (
              <Combobox.Option
                value={{ id: null, name: query }}
                className={({ active }) =>
                  `relative cursor-default select-none rounded-lg py-2 pl-10 pr-4 ${
                    active
                      ? 'bg-ui-main-500 text-white cursor-pointer'
                      : 'text-gray-900'
                  }`
                }
              >
                Create &quot;{query}&quot;
              </Combobox.Option>
            )}
            {filteredItems.map((item) => (
              <Combobox.Option
                key={item.id}
                className={({ active }) =>
                  `relative cursor-default select-none rounded-lg py-2 pl-10 pr-4 ${
                    active
                      ? 'bg-ui-main-500 text-white cursor-pointer'
                      : 'text-gray-900'
                  }`
                }
                value={item}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {item.name}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-white' : 'text-ui-main-500'
                        }`}
                      >
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
