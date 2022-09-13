import { Listbox } from '@headlessui/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConfig } from '~/utils/withConfig'

interface NetworkSelectionProps {
  onChange?: () => void
}
export const NetworkSelection = ({ onChange }: NetworkSelectionProps) => {
  const { networks } = useConfig()
  const { network, changeNetwork } = useAuth()

  const currentNetworkName = networks[network!]?.name

  const onChangeNetwork = (network: number) => {
    changeNetwork(networks[network])
    if (typeof onChange === 'function') {
      onChange()
    }
  }
  return (
    <>
      <Listbox value={network} onChange={onChangeNetwork}>
        <div className="relative">
          <label className="block px-1 mb-1 text-base" htmlFor="">
            Network:
          </label>
          <Listbox.Button className="box-border flex-1 block w-full py-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none">
            {currentNetworkName}
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 w-full mt-1 overflow-hidden bg-white border border-gray-400 rounded-xl">
            {Object.values(networks).map(({ id, name }: any) => {
              const currentSelection = name === currentNetworkName
              return (
                <Listbox.Option
                  key={id}
                  value={id}
                  className="p-3 cursor-pointer hover:bg-gray-100"
                >
                  <span className={currentSelection ? 'font-bold' : ''}>
                    {name}
                  </span>
                </Listbox.Option>
              )
            })}
          </Listbox.Options>
        </div>
      </Listbox>
    </>
  )
}
