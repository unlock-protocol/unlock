import { ReactNode } from 'react'
import { IconType } from 'react-icons'
import {
  BsGithub as GithubIcon,
  BsDiscord as DiscordIcon,
  BsTwitter as TwitterIcon,
} from 'react-icons/bs'
import { Icon } from '../Icon/Icon'
import { Link } from '../Link/Link'
import {
  EmailSubscriptionForm,
  EmailSubscriptionFormProps,
} from './EmailSubscriptionForm'

interface FooterItem {
  label: ReactNode
  url?: string
  target?: HTMLAnchorElement['target']
}

interface SocialLinkProps {
  url: string
  icon: IconType
}

interface MenuItemsProps {
  title: string
  options: FooterItem[]
}

interface FooterProps {
  privacyUrl?: string
  termsUrl?: string
  menuSections: MenuItemsProps[]
  subscriptionForm?: EmailSubscriptionFormProps
}

const SOCIAL_LINKS: SocialLinkProps[] = [
  {
    url: 'https://github.com/unlock-protocol',
    icon: GithubIcon,
  },
  {
    url: 'https://discord.com/invite/Ah6ZEJyTDp',
    icon: DiscordIcon,
  },
  {
    url: 'https://twitter.com/UnlockProtocol',
    icon: TwitterIcon,
  },
]

const Logo = (props: any) => {
  return (
    <div {...props}>
      <img className="self-start h-10" src="/images/unlock-footer-logo.svg" />
    </div>
  )
}

const FooterLink = ({ label, url, target }: FooterItem) => {
  return (
    <Link href={url} target={target}>
      <span className="text-base text-brand-dark">{label}</span>
    </Link>
  )
}

const FooterAppLink = ({ label, url }: FooterItem) => {
  return (
    <Link href={url} className="flex flex-col gap-2 cursor-pointer md:gap-4">
      <span className="text-xl font-bold text-brand-dark">{label}</span>
      <span className="w-full h-[2px] bg-black"></span>
    </Link>
  )
}

const NewsletterBox = (formProps: EmailSubscriptionFormProps) => {
  return (
    <div className="flex overflow-hidden bg-red-400 bg-cover rounded-3xl">
      <div className="grid gap-6 p-6 md:gap-2 md:px-8 md:py-20 md:grid-cols-2">
        <span className="text-2xl font-semibold tracking-wider md:col-span-1">
          Sign up for updates & fresh news about Unlock.
        </span>
        <div className="w-full md:col-span-1">
          <EmailSubscriptionForm {...formProps} />
        </div>
      </div>
    </div>
  )
}

const Footer = ({
  privacyUrl,
  termsUrl,
  menuSections,
  subscriptionForm,
}: FooterProps) => {
  return (
    <footer className="flex flex-col w-full gap-24">
      {subscriptionForm && <NewsletterBox {...subscriptionForm} />}
      <div className="flex flex-col w-full gap-16 mb-20 md:grid md:grid-cols-3 md:gap-44">
        <div className="flex flex-col w-full gap-10">
          <Logo className="self-start h-10" />
          <div className="flex flex-col gap-9">
            <FooterAppLink label="Launch App" />
            <FooterAppLink label="Get Unlock Membership" />
          </div>
          <div className="flex gap-5">
            {SOCIAL_LINKS?.map(({ url, icon }, index) => (
              <Link key={index} href={url}>
                <Icon size={25} icon={icon} />
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full col-span-2">
          <ul className="grid justify-between grid-cols-2 gap-10 md:gap-0 md:flex md:flex-row">
            {menuSections?.map(({ title, options }, index) => {
              return (
                <div className="flex flex-col gap-4" key={index}>
                  <div className="text-base font-bold text-brand-dark">
                    {title}
                  </div>
                  <div className="flex flex-col gap-4 md:gap-6">
                    {options?.map(({ label, url }, index) => (
                      <FooterLink key={index} label={label} url={url} />
                    ))}
                  </div>
                </div>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="flex flex-col w-full gap-6 py-4 border-t border-gray-400 md:gap-0 md:items-center md:justify-between md:flex-row">
        <span className="text-xs text-brand-dark">
          &copy; Unlock Lab, {new Date().getFullYear()}
        </span>
        <div className="flex gap-8">
          {privacyUrl && (
            <Link
              href={privacyUrl}
              className="text-xs text-brand-dark"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
          )}
          {termsUrl && (
            <Link
              href={termsUrl}
              className="text-xs text-brand-dark"
              target="_blank"
              rel="noopener noreferrer"
            >
              Term of Service
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
