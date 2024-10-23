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
  logo: {
    url: '/subscription',
    src: '/images/svg/logo-unlock-subscriptions.svg',
  },
  menuSections: [],
}

export default function SubscriptionHeader() {
  const { account, privyReady } = useAuthenticate()
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
              disabled={!privyReady}
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
