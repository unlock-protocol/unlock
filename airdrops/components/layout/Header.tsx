'use client'
import { usePrivy } from '@privy-io/react-auth'
import { HeaderNav } from '@unlock-protocol/ui'
import { UserMenu } from '../auth/UserMenu'
import { config } from '../../src/config/app'

const MENU_SECTIONS = [
  { title: 'Events', url: `${config.dashboardUrl}/my-events` },
  { title: 'Locks', url: `${config.dashboardUrl}/locks` },
  { title: 'Keys', url: `${config.dashboardUrl}/keychain` },
]

export default function RootHeader() {
  const { authenticated } = usePrivy()

  const menuProps = {
    extraClass: {
      mobile: 'bg-ui-secondary-200 px-6',
    },
    showSocialIcons: false,
    logo: {
      url: '/',
      src: '/images/svg/unlock-logo.svg',
    },
    menuSections: MENU_SECTIONS,
  }

  return (
    <HeaderNav
      {...menuProps}
      actions={[
        {
          content: authenticated ? <UserMenu /> : null,
        },
      ]}
    />
  )
}
