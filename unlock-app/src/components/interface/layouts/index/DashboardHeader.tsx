'use client'
import { Button, HeaderNav } from '@unlock-protocol/ui'
import { useConnectModal } from '~/hooks/useConnectModal'
import { useAuth } from '~/contexts/AuthenticationContext'
import { UserMenu } from '../../connect/UserMenu'

const MENU = {
  extraClass: {
    mobile: 'bg-ui-secondary-200 px-6',
  },
  showSocialIcons: false,
  logo: { url: '/', src: '/images/svg/unlock-logo.svg' },
  menuSections: [
    {
      title: 'Events',
      url: '/my-events',
    },
    {
      title: 'Locks',
      url: '/locks',
    },
    {
      title: 'Keys',
      url: '/keychain',
    },
  ],
}

export default function DashboardHeader() {
  const { account } = useAuth()
  const { openConnectModal } = useConnectModal()

  return (
    <HeaderNav
      {...MENU}
      actions={[
        {
          content: account ? (
            <UserMenu />
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
