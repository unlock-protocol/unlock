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
    url: '/certification',
    src: '/images/svg/logo-unlock-certificate.svg',
  },
  menuSections: [],
}

export default function CertificationHeader() {
  const { account, ready } = useAuthenticate()
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
              disabled={!ready}
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
