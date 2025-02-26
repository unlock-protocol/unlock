'use client'
import { usePrivy } from '@privy-io/react-auth'
import { HeaderNav } from '@unlock-protocol/ui'
import { UserMenu } from '../auth/UserMenu'

const MENU_SECTIONS = [
  { title: 'Events', url: 'https://app.unlock-protocol.com/my-events' },
  { title: 'Locks', url: 'https://app.unlock-protocol.com/locks' },
  { title: 'Keys', url: 'https://app.unlock-protocol.com/keychain' },
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
