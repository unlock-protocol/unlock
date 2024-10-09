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
  logo: {
    url: '/subscription',
    src: '/images/svg/logo-unlock-subscriptions.svg',
  },
  menuSections: [],
}

export default function SubscriptionHeader() {
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
