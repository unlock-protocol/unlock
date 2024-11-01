'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MdExitToApp as DisconnectIcon } from 'react-icons/md'
import Link from 'next/link'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { useCallback, useState } from 'react'
import { useUnlockPrime } from '~/hooks/useUnlockPrime'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export const UserMenu = () => {
  const { isPrime } = useUnlockPrime()
  const { account } = useAuthenticate()
  const userEns = useEns(account || '')
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const { signOut } = useAuthenticate()

  const handleLogout = useCallback(async () => {
    setIsDisconnecting(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }, [signOut])

  return (
    <Menu as="div" className="relative inline-block z-10 text-left">
      <MenuButton className="flex items-center gap-2">
        <span className="text-brand-ui-primary text-right">
          {userEns === account ? addressMinify(userEns) : userEns}
        </span>
        <DisconnectIcon className="text-brand-ui-primary" size={20} />
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="px-1 py-1">
          <MenuItem>
            {({ active }) => {
              if (isPrime) {
                return (
                  <Link
                    href="/prime"
                    className="text-gray-700 group text-sm w-full items-center rounded-md px-2 py-2"
                  >
                    💫 You are a{' '}
                    <span
                      className="mx-1  font-extrabold text-transparent  bg-clip-text"
                      style={{
                        backgroundImage:
                          'linear-gradient(85.7deg, #603DEB 3.25%, #F19077 90.24%)',
                      }}
                    >
                      Prime Member
                    </span>
                    !
                  </Link>
                )
              }
              return (
                <Link
                  href="/prime"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center rounded-md px-2 py-2 text-base`}
                >
                  🪄 Join{' '}
                  <span
                    className="mx-1 text-sm font-extrabold text-transparent uppercase bg-clip-text"
                    style={{
                      backgroundImage:
                        'linear-gradient(85.7deg, #603DEB 3.25%, #F19077 90.24%)',
                    }}
                  >
                    Unlock Prime
                  </span>
                  !
                </Link>
              )
            }}
          </MenuItem>
        </div>
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
                onClick={handleLogout}
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
