'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MdExitToApp as DisconnectIcon } from 'react-icons/md'
import Link from 'next/link'
import { useAuth } from '~/contexts/AuthenticationContext'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { useCallback, useState } from 'react'
import { useSIWE } from '~/hooks/useSIWE'

export const UserMenu = () => {
  const { account, email, deAuthenticate } = useAuth()
  const userEns = useEns(account || '')
  const { signOut } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const onSignOut = useCallback(async () => {
    setIsDisconnecting(true)
    await signOut()
    await deAuthenticate()
    setIsDisconnecting(false)
  }, [signOut, deAuthenticate])

  return (
    <Menu as="div" className="relative inline-block text-left z-40">
      <MenuButton className="flex items-center gap-2">
        <span className="text-brand-ui-primary text-right">
          {userEns === account
            ? email
              ? email
              : addressMinify(userEns)
            : userEns}
        </span>
        <DisconnectIcon className="text-brand-ui-primary" size={20} />
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="px-1 py-1">
          <MenuItem>
            {({ active }) => (
              <Link
                href="/settings"
                className={`${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } group flex w-full items-center rounded-md px-2 py-2 text-base`}
              >
                Settings
              </Link>
            )}
          </MenuItem>
        </div>
        <div className="px-1 py-1">
          <MenuItem>
            {({ active }) => (
              <button
                onClick={onSignOut}
                disabled={isDisconnecting}
                className={`${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } group flex w-full items-center rounded-md px-2 py-2 text-base`}
              >
                {isDisconnecting ? 'Signing out...' : 'Sign out'}
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
