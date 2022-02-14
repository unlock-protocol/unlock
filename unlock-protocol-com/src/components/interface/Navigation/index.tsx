import { Link } from '../../helpers/Link'
import { Popover, Transition, Disclosure } from '@headlessui/react'
import { Button } from '@unlock-protocol/ui'
import React, { Fragment } from 'react'
import { MdFormatListBulleted as BulletedListIcon } from 'react-icons/md'
import { FaHeartbeat as HeartBeatIcon } from 'react-icons/fa'
import { FiLifeBuoy as LifeBuoyIcon, FiCode as CodeIcon } from 'react-icons/fi'
import { IconType } from 'react-icons'
import { UnlockTextIcon } from '../../icons'
import { FilesIcon } from '../../icons/Util'
import {
  AiOutlineDown as DownIcon,
  AiOutlineUp as UpIcon,
} from 'react-icons/ai'
import { HiX as XIcon, HiMenu as MenuIcon } from 'react-icons/hi'
interface NavigationLink {
  name: string
  href: string
}

interface NavigationalLinkWithIcon extends NavigationLink {
  Icon: IconType
}

const DEVELOPER_NAVIGATION_INTEGRATIONS: NavigationLink[] = [
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

const DEVELOPER_NAVIGATION_RECIPES: NavigationLink[] = [
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

const DEVELOPER_NAVIGATION_BOTTOM_ITEMS: NavigationalLinkWithIcon[] = [
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

function DeveloperPopover() {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`hover:text-brand-dark ${
              open ? 'text-black' : 'text-brand-gray'
            }`}
          >
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
              <div className="glass-pane rounded-3xl">
                <div className="grid p-4">
                  <header className="flex gap-2 pb-6 items-base">
                    <div>
                      <FilesIcon className="not-sr-only" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold"> Documentation </p>
                      <p className="text-sm text-brand-gray">
                        Your starting point for the integration of Unlock into
                        other platforms
                      </p>
                    </div>
                  </header>
                  <div className="flex justify-between max-w-[400px] pl-8">
                    <div>
                      <p className="text-xs font-bold uppercase ">
                        Integrations
                      </p>
                      <nav className="grid gap-1 pt-2">
                        {DEVELOPER_NAVIGATION_INTEGRATIONS.map(
                          (item, index) => (
                            <Link
                              className="text-sm text-brand-gray hover:text-brand-dark"
                              key={index}
                              href={item.href}
                            >
                              {item.name}
                            </Link>
                          )
                        )}
                      </nav>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase ">Recipes</p>
                      <nav className="grid gap-1 pt-2">
                        {DEVELOPER_NAVIGATION_RECIPES.map((item, index) => (
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
                  <div className="grid grid-cols-2 gap-1 p-4 bg-white rounded-3xl">
                    {DEVELOPER_NAVIGATION_BOTTOM_ITEMS.map(
                      ({ name, href, Icon }, index) => (
                        <Link
                          href={href}
                          key={index}
                          className="flex gap-2 p-2 text-sm font-medium rounded-xl hover:bg-slate-50"
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
  )
}

function Desktop() {
  const link = 'text-brand-gray hover:text-black'

  return (
    <div className="items-center hidden gap-6 sm:flex">
      <DeveloperPopover />
      <Link className={link} href="/about">
        About
      </Link>
      <Link
        className={link}
        href="https://docs.unlock-protocol.com/unlock/creators/faq"
      >
        Creators
      </Link>
      <Button variant="outlined-primary" as={Link}>
        Connect Wallet
      </Button>
    </div>
  )
}

function Mobile() {
  return (
    <Disclosure.Panel className="mx-4 space-y-1 sm:hidden rounded-xl glass-pane">
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex items-center justify-between w-full p-4 font-medium bg-white shadow-lg rounded-xl">
              For Devs {open ? <UpIcon /> : <DownIcon />}{' '}
            </Disclosure.Button>
            <div className={`${open ? 'grid' : 'hidden'}`}>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase ">Integrations</p>
                  <nav className="grid gap-1 pt-2">
                    {DEVELOPER_NAVIGATION_INTEGRATIONS.map((item, index) => (
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
                  <p className="text-xs font-bold uppercase ">Recipes</p>
                  <nav className="grid gap-1 pt-2">
                    {DEVELOPER_NAVIGATION_RECIPES.map((item, index) => (
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
              <div className="p-4 m-2 space-y-2 bg-white rounded-3xl">
                {DEVELOPER_NAVIGATION_BOTTOM_ITEMS.map(
                  ({ name, href, Icon }, index) => (
                    <Link
                      href={href}
                      key={index}
                      className="flex gap-2 p-2 text-sm font-medium rounded-xl hover:bg-slate-50"
                    >
                      <Icon className="text-lg not-sr-only text-brand-ui-primary" />
                      {name}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </Disclosure>
      <div className="grid gap-4 p-4 bg-white rounded-xl">
        <Link href="/about"> About us </Link>
        <Link href="https://docs.unlock-protocol.com/unlock/creators/faq">
          Creators
        </Link>
        <Button>Connect Wallet</Button>
      </div>
    </Disclosure.Panel>
  )
}

export function Navigation() {
  return (
    <Disclosure as="nav" className="fixed z-10 w-full ">
      {({ open }) => (
        <>
          <div className="max-w-screen-lg px-6 py-4 mx-auto bg-brand-primary">
            <div className="flex items-center justify-between">
              <Link href="/">
                <UnlockTextIcon />
              </Link>
              <div className="sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon
                      className="block w-6 h-6 fill-brand-ui-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <Desktop />
            </div>
          </div>
          <Mobile />
        </>
      )}
    </Disclosure>
  )
}
