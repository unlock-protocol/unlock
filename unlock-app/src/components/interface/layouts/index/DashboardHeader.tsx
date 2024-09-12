'use client'
import { Button, HeaderNav } from '@unlock-protocol/ui'
import { useConnectModal } from '~/hooks/useConnectModal'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { MdExitToApp as DisconnectIcon } from 'react-icons/md'
import { useAuth } from '~/contexts/AuthenticationContext'

const MENU = {
  extraClass: {
    mobile: 'bg-ui-secondary-200 px-6',
  },
  showSocialIcons: false,
  logo: { url: 'logoRedirectUri', src: 'logoSrc' },
  menuSections: [
    {
      title: 'Locks',
      url: '/locks',
    },
    {
      title: 'Keys',
      url: '/keychain',
    },
    {
      title: 'Settings',
      url: '/settings',
    },
  ],
}

export default function DashboardHeader() {
  const { account, email } = useAuth()
  const { openConnectModal } = useConnectModal()
  const userEns = useEns(account || '')

  return (
    <HeaderNav
      {...MENU}
      actions={[
        {
          content: account ? (
            <div className="flex gap-2">
              <button
                onClick={(event) => {
                  event.preventDefault()
                  openConnectModal()
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-brand-ui-primary text-right">
                    {userEns === account
                      ? email
                        ? email
                        : addressMinify(userEns)
                      : userEns}
                  </span>
                  <DisconnectIcon className="text-brand-ui-primary" size={20} />
                </div>
              </button>
            </div>
          ) : (
            <Button
              onClick={(event) => {
                event.preventDefault()
                openConnectModal()
              }}
            >
              Connect
            </Button>
          ),
        },
      ]}
    />
  )
}
