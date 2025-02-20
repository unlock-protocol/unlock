'use client'
import { usePrivy } from '@privy-io/react-auth'
import { Button, HeaderNav } from '@unlock-protocol/ui'

const MENU_SECTIONS = [
  { title: 'Events', url: '/my-events' },
  { title: 'Locks', url: '/locks' },
  { title: 'Keys', url: '/keychain' },
]

export default function RootHeader() {
  const { authenticated, logout } = usePrivy()

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
          content: authenticated ? (
            <Button size="small" variant="outlined-primary" onClick={logout}>
              Disconnect
            </Button>
          ) : null,
        },
      ]}
    />
  )
}
