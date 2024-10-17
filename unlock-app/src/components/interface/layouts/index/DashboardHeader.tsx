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

interface DashboardHeaderProps {
  showMenu?: boolean
}

export default function DashboardHeader({
  showMenu = true,
}: DashboardHeaderProps) {
  const { account } = useAuth()
  const { openConnectModal } = useConnectModal()

  const menuProps = showMenu ? MENU : { ...MENU, menuSections: [] }

  return (
    <HeaderNav
      {...menuProps}
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
