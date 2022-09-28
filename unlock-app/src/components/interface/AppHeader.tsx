import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useAuth } from '~/contexts/AuthenticationContext'
import { addressMinify } from '~/utils/strings'
import { useRouter } from 'next/router'
import { useConfig } from '~/utils/withConfig'
import { CryptoIcon } from './locks/elements/KeyPrice'
import { HiChevronDown as ArrowDownButton } from 'react-icons/hi'
import { Popover, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { AiOutlineMenu as MenuIcon } from 'react-icons/ai'
import { GrClose as MenuCloseIcon } from 'react-icons/gr'

interface Link {
  label: string
  url: string
}

const links: Link[] = [
  { label: 'Locks', url: '/locks' },
  { label: 'Keys', url: '/keychain' },
  { label: 'Settings', url: '/settings' },
]

interface SwitchNetworkButtonProps {
  network: number
}

const SwitchNetworkButton = ({ network }: SwitchNetworkButtonProps) => {
  const { networks } = useConfig()
  const { changeNetwork } = useAuth()

  const { name: connectedNetwork, baseCurrencySymbol } = networks[network] ?? {}

  const onChangeNetwork = async (network: number) => {
    await changeNetwork(networks[network])
  }

  return (
    <>
      <Popover className="relative">
        <Popover.Button className="focus:outline-none">
          <Button
            variant="outlined-primary"
            className="w-12 h-12 md:w-full md:h-full focus:outline-none"
          >
            <div className="flex items-center gap-1">
              <CryptoIcon symbol={baseCurrencySymbol} />
              <div className="items-center hidden gap-1 md:flex">
                <span className="text-base">{connectedNetwork}</span>
                <ArrowDownButton size={15} />
              </div>
            </div>
          </Button>
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute z-10 mt-3 transform -translate-x-1/2 w-60 left-1/2 sm:px-0">
            <div className="relative py-3 overflow-hidden bg-white shadow-lg rounded-3xl">
              <div className="flex flex-col">
                {Object.values(networks).map(
                  ({ name, baseCurrencySymbol, id }: any) => {
                    const isActive = id === network
                    return (
                      <div
                        key={id}
                        className={`flex cursor-pointer px-4 py-2 gap-2 hover:bg-gray-100 ${
                          isActive ? 'bg-gray-200' : ''
                        }`}
                        onClick={() => onChangeNetwork(id)}
                      >
                        <div className="w-6 h-6">
                          <CryptoIcon size={24} symbol={baseCurrencySymbol} />
                        </div>
                        <span className="text-base">{name}</span>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  )
}

export const AppHeader = () => {
  const { account, network } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const loginUrl = `/login?redirect=${encodeURIComponent(window.location.href)}`

  return (
    <div className="pt-5 bg-ui-secondary-200">
      <div className="flex justify-between px-4 mx-auto lg:container">
        <div className="flex items-center gap-10">
          <div className="flex gap-2">
            <button
              className="flex md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="menu-button"
            >
              {isOpen ? <MenuCloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
            <div className="h-5 md:h-6">
              <img src="/images/svg/unlock-logo.svg" alt="logo" />
            </div>
          </div>

          <div
            className={`bg-ui-secondary-200 ${
              isOpen ? 'fixed inset-0 top-20 px-10 pt-20' : ''
            }`}
          >
            <ul className="flex flex-col gap-8 md:px-0 md:flex-row">
              {links?.map(({ label, url }, index) => {
                const isActive = router.pathname === url
                return (
                  <li
                    key={index}
                    className={`text-lg ${
                      isActive ? 'text-brand-ui-primary' : ''
                    }`}
                  >
                    <Link href={url}>{label}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div>
          {account ? (
            <div className="flex gap-2">
              <SwitchNetworkButton network={network!} />
              <Button variant="outlined-primary">
                <span className="text-brand-ui-primary">
                  {addressMinify(account)}
                </span>
              </Button>
            </div>
          ) : (
            <Link href={loginUrl}>
              <Button>Connect</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
