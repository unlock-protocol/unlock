import { Link } from '../../helpers/Link'
import { Popover, Transition } from '@headlessui/react'
import { Button } from '@unlock-protocol/ui'
import React, { Fragment, SVGProps } from 'react'
import { MdFormatListBulleted as BulletedListIcon } from 'react-icons/md'
import { FaHeartbeat as HeartBeatIcon } from 'react-icons/fa'
import { FiLifeBuoy as LifeBuoyIcon, FiCode as CodeIcon } from 'react-icons/fi'
import { IconType } from 'react-icons'
import { UnlockTextIcon } from '../../icons'
interface NavigationLink {
  name: string
  href: string
}

interface NavigationalLinkWithIcon extends NavigationLink {
  Icon: IconType
}

const NAVIGATION_INTEGRATIONS: NavigationLink[] = [
  {
    name: 'WordPress',
    href: '',
  },
  {
    name: 'Webflow',
    href: '',
  },
  {
    name: 'Shopify',
    href: '',
  },
  {
    name: 'Discourse',
    href: '',
  },
]

const NAVIGATION_RECIPES: NavigationLink[] = [
  {
    name: 'Making a custom login',
    href: '',
  },
  {
    name: 'Webhooks',
    href: '',
  },
  {
    name: 'Create your own API',
    href: '',
  },
  {
    name: 'Manage keys',
    href: '',
  },
]

const NAVIGATION_BOTTOM_ITEMS: NavigationalLinkWithIcon[] = [
  {
    name: 'API Reference',
    Icon: BulletedListIcon,
    href: '',
  },
  {
    name: 'API Status',
    Icon: HeartBeatIcon,
    href: '',
  },
  {
    name: 'Support',
    Icon: LifeBuoyIcon,
    href: '',
  },
  {
    name: 'Changelong',
    Icon: CodeIcon,
    href: '',
  },
]

export function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-brand-primary">
      <nav className="flex items-center justify-between max-w-screen-lg px-6 mx-auto">
        <div>
          <Link href="/" aria-label="Unlock">
            <UnlockTextIcon className="not-sr-only" />
          </Link>
        </div>
        <div className="flex items-center gap-6 p-4 ">
          <Popover className="relative">
            {({}) => (
              <>
                <Popover.Button className="text-brand-gray hover:text-brand-dark">
                  Devs
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute w-screen max-w-xl px-4 mt-3 transform -translate-x-1/2 z-100 left-1/2">
                    <div className="bg-shadow-and-glass rounded-3xl">
                      <div className="grid p-4">
                        <header className="flex gap-2 pb-6 items-base">
                          <div>
                            <FilesIcon className="not-sr-only" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold"> Documentation </p>
                            <p className="text-sm text-brand-gray">
                              Your starting point for the integration of Unlock
                              into other platforms
                            </p>
                          </div>
                        </header>
                        <div className="flex justify-between max-w-[400px] pl-8">
                          <div>
                            <p className="text-xs font-bold uppercase ">
                              Integrations
                            </p>
                            <nav className="grid gap-1 pt-2">
                              {NAVIGATION_INTEGRATIONS.map((item, index) => (
                                <Link
                                  className="text-sm text-brand-gray hover:text-brand-dark"
                                  key={index}
                                  href={item.href}
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </nav>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase ">
                              Recipes
                            </p>
                            <nav className="grid gap-1 pt-2">
                              {NAVIGATION_RECIPES.map((item, index) => (
                                <Link
                                  className="text-sm text-brand-gray hover:text-brand-dark"
                                  key={index}
                                  href={item.href}
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </nav>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-3xl">
                          {NAVIGATION_BOTTOM_ITEMS.map(
                            ({ name, href, Icon }, index) => (
                              <Link
                                href={href}
                                key={index}
                                className="flex gap-2 text-sm font-medium"
                              >
                                <Icon className="text-lg not-sr-only text-brand-ui-primary" />
                                {name}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
          <Link className="text-brand-gray hover:text-brand-dark" href="/about">
            About
          </Link>
          <Link
            className="text-brand-gray hover:text-brand-dark"
            href="/creators"
          >
            Creators
          </Link>
          <Button variant="outlined-primary"> Connect Wallet </Button>
        </div>
      </nav>
    </header>
  )
}

function FilesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15.75 21H5.25C5.05109 21 4.86032 20.921 4.71967 20.7803C4.57902 20.6397 4.5 20.4489 4.5 20.25V6.75C4.5 6.55109 4.57902 6.36032 4.71967 6.21967C4.86032 6.07902 5.05109 6 5.25 6H12.75L16.5 9.75V20.25C16.5 20.4489 16.421 20.6397 16.2803 20.7803C16.1397 20.921 15.9489 21 15.75 21Z"
        stroke="#603DEB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6V3.75C7.5 3.55109 7.57902 3.36032 7.71967 3.21967C7.86032 3.07902 8.05109 3 8.25 3H15.75L19.5 6.75V17.25C19.5 17.4489 19.421 17.6397 19.2803 17.7803C19.1397 17.921 18.9489 18 18.75 18H16.5"
        stroke="#603DEB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 14.25H12.75"
        stroke="#603DEB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 17.25H12.75"
        stroke="#603DEB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
