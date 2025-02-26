'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MdExitToApp as DisconnectIcon } from 'react-icons/md'
import { usePrivy } from '@privy-io/react-auth'
import { minifyAddress } from '@unlock-protocol/ui'

export const UserMenu = () => {
  const { user, logout } = usePrivy()
  const address = user?.wallet?.address || ''

  return (
    <Menu as="div" className="relative inline-block z-10 text-left">
      <MenuButton className="flex items-center gap-2">
        <span className="text-brand-ui-primary text-right">
          {minifyAddress(address)}
        </span>
        <DisconnectIcon className="text-brand-ui-primary" size={20} />
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="px-1 py-1">
          <MenuItem>
            {({ active }) => (
              <button
                onClick={logout}
                className={`${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } group flex w-full items-center rounded-md px-2 py-2 text-base`}
              >
                Disconnect
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
