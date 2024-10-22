'use client'
import { Button, HeaderNav } from '@unlock-protocol/ui'
import { useConnectModal } from '~/hooks/useConnectModal'
import { UserMenu } from '../../connect/UserMenu'
import { useAuthenticate } from '~/hooks/useAuthenticate'

const MENU = {
  extraClass: {
    mobile: 'bg-ui-secondary-200 px-6',
  },
  showSocialIcons: false,
  logo: { url: '/event', src: '/images/svg/logo-unlock-events.svg' },
  menuSections: [
    {
      title: 'Events',
      url: '/my-events',
    },
  ],
}

export default function EventHeader() {
  const { account } = useAuthenticate()
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
