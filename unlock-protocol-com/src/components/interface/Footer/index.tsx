import { UnlockTextIcon } from '../../icons'
import { Link } from '../../helpers/Link'
import { EmailSubscriptionForm } from '../../forms/EmailSubscription'
import {
  EMAIL_SUBSCRIPTION_FORM,
  UNLOCK_LINKS,
} from '../../../config/constants'
import { SOCIAL_URL } from '../../../config/seo'
import { unlockConfig } from '../../../config/unlock'
type LinkType = Record<'name' | 'href', string>

const FOOTER_BOTTOM_NAVIGATION: Record<string, LinkType[]> = {
  App: [
    {
      name: 'Creator Dashboard',
      href: unlockConfig.appURL!,
    },
    {
      name: 'Membership',
      href: '/membership',
    },
  ],
  Community: [
    {
      name: 'Discord',
      href: SOCIAL_URL.discord,
    },
    {
      name: 'Forum',
      href: SOCIAL_URL.discourse,
    },
    {
      name: 'Snapshot',
      href: SOCIAL_URL.snapshot,
    },
    {
      name: 'Github',
      href: SOCIAL_URL.github,
    },
    {
      name: 'Twitter',
      href: SOCIAL_URL.twitter,
    },
  ],
  Navigation: [
    {
      name: 'About',
      href: '/about',
    },
    {
      name: 'Careers',
      href: 'https://www.notion.so/unlockprotocol/Unlock-Jobs-907811d15c4d490091eb298f71b0954c',
    },
    {
      name: 'Blog',
      href: '/blog',
    },
    {
      name: 'Meida Kit',
      href: 'https://unlockprotocol.notion.site/Press-Kit-35836bdcc88f400eb5bb429c477c3333",
    },
    {
      name: 'Integrations',
      href: 'https://docs.unlock-protocol.com/move-to-guides/plugins-and-integrations/',
    },
    {
      name: 'Developers',
      href: '/developers',
    },
    {
      name: 'Grants',
      href: '/grants',
    },
    {
      name: 'Guides',
      href: '/guides',
    },
    {
      name: 'Privacy',
      href: '/privacy',
    },
    {
      name: 'Terms',
      href: '/terms',
    },
  ],
}

export function Footer() {
  return (
    <footer className="w-full text-white bg-brand-dark">
      <div className="px-4 py-16 space-y-16 max-w-7xl sm:mx-auto">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm space-y-2 lg:max-w-lg">
            <h4 className="text-3xl font-semibold lg:text-4xl">
              Sign up for Updates
            </h4>
            <p className="md:text-lg">
              We&apos;ll send you fresh news about our platform, including new
              features and opportunities for the community.
            </p>
          </div>
          <div>
            <EmailSubscriptionForm
              portalId={EMAIL_SUBSCRIPTION_FORM.portalId}
              formGuid={EMAIL_SUBSCRIPTION_FORM.formGuid}
            />
          </div>
        </div>
        <div className="flex sm:justify-between">
          <div className="hidden sm:block">
            <Link href="/" aria-label="Unlock">
              <UnlockTextIcon className="not-sr-only fill-white" />
            </Link>
          </div>
          <div className="grid gap-12 sm:grid-cols-3">
            {Object.entries(FOOTER_BOTTOM_NAVIGATION).map(([title, items]) => (
              <div className="flex flex-col items-baseline gap-4" key={title}>
                <h5 className="font-bold"> {title}</h5>
                <nav className="grid gap-2">
                  {items.map(({ name, href }, index) => (
                    <Link href={href} key={index}>
                      {name}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
