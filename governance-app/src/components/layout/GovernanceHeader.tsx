// ABOUTME: Client-side governance app header with wallet connect/disconnect.
// Uses HeaderNav from @unlock-protocol/ui and useGovernanceWallet for auth state.
'use client'

import { Button, HeaderNav } from '@unlock-protocol/ui'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MdExitToApp as DisconnectIcon } from 'react-icons/md'
import { truncateAddress } from '~/lib/governance/format'
import { governanceRoutes } from '~/config/governance'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'
import { useConnectModal } from '~/hooks/useConnectModal'

export function GovernanceHeader() {
  const { address, authenticated, disconnect, isReady } = useGovernanceWallet()
  const { openConnectModal } = useConnectModal()

  const menuSections = governanceRoutes.map((route) => ({
    title: route.label,
    url: route.href,
  }))

  return (
    <div className="border-b border-brand-ui-primary/10 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <HeaderNav
          logo={{ url: '/', src: '/images/unlock-logo.svg' }}
          menuSections={menuSections}
          actions={[
            {
              content:
                authenticated && address ? (
                  <Menu
                    as="div"
                    className="relative z-10 inline-block text-left"
                  >
                    <MenuButton className="flex items-center gap-2 text-brand-ui-primary">
                      <span className="text-sm font-medium">
                        {truncateAddress(address, 6)}
                      </span>
                      <DisconnectIcon size={18} />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                      <div className="px-1 py-1">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => disconnect()}
                              className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700`}
                            >
                              Sign out
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                ) : (
                  <Button disabled={!isReady} onClick={openConnectModal}>
                    Connect
                  </Button>
                ),
            },
          ]}
        />
      </div>
    </div>
  )
}
