'use client'
import { Button, HeaderNav } from '@unlock-protocol/ui'
import { useConnectModal } from '~/hooks/useConnectModal'
import { UserMenu } from '../../connect/UserMenu'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { usePathname } from 'next/navigation'


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
  const { account } = useAuthenticate()
  const { openConnectModal } = useConnectModal()
  const pathname = usePathname()

  const menuProps =
    showMenu && pathname !== '/' ? MENU : { ...MENU, menuSections: [] }

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
