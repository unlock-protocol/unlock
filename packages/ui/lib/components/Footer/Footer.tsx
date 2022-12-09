import { ReactNode } from 'react'
import { SOCIAL_LINKS } from '../constants'
import LogoUrl from './../../assets/unlock-footer-logo.svg'

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

interface MenuItemsProps {
  title: string
  options: FooterItem[]
}

type ActionsProps =
  | {
      label: string
      url: string
    }
  | {
      label: string
      onClick: () => void
    }

interface FooterProps {
  logoUrl: string // url of the website to redirect when logo is clicked
  actions?: ActionsProps[]
  privacyUrl?: string
  termsUrl?: string
  menuSections: MenuItemsProps[]
  subscriptionForm?: EmailSubscriptionFormProps
}

const FooterLink = ({ label, url }: { label: string; url: string }) => {
  return (
    <Link href={url}>
      <span className="text-base duration-100 text-brand-dark hover:text-brand-ui-primary">
        {label}
      </span>
    </Link>
  )
}

const FooterAppLink = (action: ActionsProps): JSX.Element | null => {
  const { label } = action

  const ActionLabel = ({ label, ...props }: { label: string } & any) => {
    return (
      <div
        className="flex flex-col gap-2 cursor-pointer md:gap-4 group"
        {...props}
      >
        <span className="text-xl font-bold duration-100 text-brand-dark group-hover:text-brand-ui-primary">
          {label}
        </span>
        <span className="w-full h-[2px] duration-100 bg-black"></span>
      </div>
    )
  }

  if ('url' in action) {
    return (
      <Link href={action.url}>
        <ActionLabel label={label} />
      </Link>
    )
  }

  if ('onClick' in action) {
    return <ActionLabel label={label} onClick={action.onClick} />
  }

  return null
}

const Footer = ({
  privacyUrl,
  termsUrl,
  menuSections,
  subscriptionForm,
  logoUrl,
  actions,
}: FooterProps) => {
  return (
    <footer className="flex flex-col w-full gap-24">
      {subscriptionForm && <EmailSubscriptionForm {...subscriptionForm} />}
      <div className="flex flex-col w-full gap-16 mb-20 md:grid md:grid-cols-3 md:gap-44">
        <div className="flex flex-col w-full gap-10">
          <Link href={logoUrl}>
            <img src={LogoUrl} alt="logo" className="h-10" />
          </Link>

          <div className="flex flex-col gap-9">
            {actions?.map((action, index) => {
              return <FooterAppLink key={index} {...action} />
            })}
          </div>

          <div className="flex gap-5">
            {SOCIAL_LINKS?.map(({ url, icon }, index) => (
              <Link
                key={index}
                href={url}
                className="hover:text-brand-ui-primary"
              >
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
