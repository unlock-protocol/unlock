'use client'
import { Button, HeaderNav } from '@unlock-protocol/ui'
import { useConnectModal } from '~/hooks/useConnectModal'
import { UserMenu } from '../../connect/UserMenu'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { usePathname } from 'next/navigation'
import { NotificationsMenu } from './NotificationsMenu'
import { LanguageSwitcher } from '../../LanguageSwitcher'
import { useTranslations } from '~/contexts/LanguageContext'

// Paths where menu should be hidden
const HIDDEN_MENU_PATHS = ['/migrate-user', '/recover']

const HIDDEN_CONNECT_PATHS = ['/migrate-user', '/recover']

// Menu sections shown everywhere when logged in
interface DashboardHeaderProps {
  showMenu?: boolean
}

export default function DashboardHeader({
  showMenu = true,
}: DashboardHeaderProps) {
  const { account, privyReady } = useAuthenticate()
  const { openConnectModal } = useConnectModal()
  const pathname = usePathname()
  const t = useTranslations('header')

  // Determine logo config based on pathname
  const getLogo = () => {
    if (pathname?.includes('subscription')) {
      return {
        url: '/subscription',
        src: '/images/svg/logo-unlock-subscriptions.svg',
      }
    }
    if (pathname?.includes('event')) {
      return {
        url: '/event',
        src: '/images/svg/logo-unlock-events.svg',
      }
    }
    if (pathname?.includes('certification')) {
      return {
        url: '/certification',
        src: '/images/svg/logo-unlock-certificate.svg',
      }
    }
    return {
      url: '/',
      src: '/images/svg/unlock-logo.svg',
    }
  }

  // Determine if menu should be shown
  const shouldShowMenu =
    showMenu && account && !HIDDEN_MENU_PATHS.includes(pathname || '')

  // Determine if menu should be shown
  const shouldConnect = !HIDDEN_CONNECT_PATHS.includes(pathname || '')

  const menuProps = {
    extraClass: {
      mobile: 'bg-ui-secondary-200 px-6',
    },
    showSocialIcons: false,
    logo: getLogo(),
    menuSections: shouldShowMenu
      ? [
          { title: t('events'), url: '/my-events' },
          { title: t('locks'), url: '/locks' },
          { title: t('keys'), url: '/keychain' },
        ]
      : [],
  }

  return (
    <HeaderNav
      {...menuProps}
      actions={[
        {
          content: pathname?.includes('migrate-user') ? null : (
            <NotificationsMenu />
          ),
        },
        {
          content: <LanguageSwitcher />,
        },
        {
          content: !shouldConnect ? null : account ? (
            <UserMenu />
          ) : (
            <Button
              disabled={!privyReady}
              onClick={(event) => {
                event.preventDefault()
                openConnectModal()
              }}
            >
              {t('connect')}
            </Button>
          ),
        },
      ]}
    />
  )
}
