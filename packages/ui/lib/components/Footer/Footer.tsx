import { ReactNode } from 'react'
import { IconType } from 'react-icons'
import {
  BsGithub as GithubIcon,
  BsDiscord as DiscordIcon,
  BsTwitter as TwitterIcon,
} from 'react-icons/bs'
import { Icon } from '../Icon/Icon'
import { Link } from '../Link/Link'
import { EmailSubscriptionForm } from './EmailSubscriptionForm'

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
  menuItems: MenuItemsProps[]
}

const SOCIAL_LINKS: SocialLinkProps[] = [
  {
    url: '',
    icon: GithubIcon,
  },
  {
    url: '',
    icon: DiscordIcon,
  },
  {
    url: '',
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

const NewsletterBox = () => {
  return (
    <div
      className="flex overflow-hidden bg-cover rounded-3xl"
      style={{
        background: "url('/images/img-signup-lg.svg')",
      }}
    >
      <div className="px-8 py-20 ">
        <span className="text-2xl font-semibold tracking-wider">
          Sign up for updates & fresh news about Unlock.
        </span>
        <div className="w-full">
          <EmailSubscriptionForm />
        </div>
      </div>
    </div>
  )
}

const Footer = ({ privacyUrl, termsUrl, menuItems }: FooterProps) => {
  return (
    <footer className="flex flex-col gap-24">
      <NewsletterBox />
      <div className="flex flex-col gap-16 mb-20 md:grid md:grid-cols-3 md:gap-44">
        <div className="flex flex-col gap-10">
          <Logo className="self-start h-10" />
          <div className="flex flex-col gap-9">
            <FooterAppLink label="Launch App" />
            <FooterAppLink label="Get Unlock Membership" />
          </div>
          <div className="flex gap-5">
            {SOCIAL_LINKS?.map(({ url, icon }) => (
              <a href={url}>
                <Icon size={25} icon={icon} />
              </a>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <ul className="grid justify-between grid-cols-2 gap-10 md:gap-0 md:flex md:flex-row">
            {menuItems?.map(({ title, options }, index) => {
              return (
                <div className="flex flex-col gap-4" key={index}>
                  <div className="text-base font-bold text-brand-dark">
                    {title}
                  </div>
                  <div className="flex flex-col gap-4 md:gap-6">
                    {options?.map(({ label, url }, index) => {
                      return <FooterLink key={index} label={label} url={url} />
                    })}
                  </div>
                </div>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-6 py-4 border-t border-gray-400 md:gap-0 md:items-center md:justify-between md:flex-row">
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
