import { Popover, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { Button } from '../Button/Button'
import { SOCIAL_LINKS } from '../constants'
import { Icon } from '../Icon/Icon'
import { Link } from '../Link/Link'
import { HTMLProps } from 'react'
import { IconType } from 'react-icons'
import LogoUrl from './../../assets/unlock-footer-logo.svg'
import {
  FiMenu as MenuIcon,
  FiPlus as PlusIcon,
  FiMinus as MinusIcon,
} from 'react-icons/fi'
import { CgClose as CloseIcon } from 'react-icons/cg'
import { Size } from '~/types'

interface NavbarMenuProps {
  title: string
  options: { title: string; url: string }[]
}

interface NavbarImageProps {
  title: string
  src: string
  url: string
  alt?: string
}

interface NavLinkProps {
  title: string
  url: string
}

interface NavEmbedProps {
  title: string
  embed: string
}

type NavOptionProps =
  | NavbarMenuProps
  | NavbarImageProps
  | NavLinkProps
  | NavEmbedProps

type MenuSectionSize = Extract<Size, 'small' | 'medium'>
type MenuSectionProps =
  | {
      title: string
      size?: MenuSectionSize
      options: NavOptionProps[]
    }
  | {
      title: string
      size?: MenuSectionSize
      url: string
    }

interface ActionsProps {
  title: string
  url: string
  icon?: IconType
}
interface NavbarProps {
  menuSections: MenuSectionProps[]
  actions: ActionsProps[]
  logo: {
    url: string
    src?: string
  }
  extraClass?: {
    mobile?: string
    desktop?: string
  }
}

const POPOVER_CLASSES: Record<MenuSectionSize, string> = {
  small: 'w-64 -ml-24 pt-4 lg:pt-9 sm:px-0',
  medium: 'w-full pt-4 transform -translate-x-1/2 lg:pt-9 left-1/2 sm:px-0',
}

const NavSectionTitle = ({
  title,
  className,
}: { title: string } & HTMLProps<HTMLAnchorElement>) => {
  return (
    <div
      className={`text-xl font-bold duration-200 text-brand-dark ${className}`}
    >
      {title}
    </div>
  )
}

const SocialIcons = () => {
  return (
    <div className="flex gap-4">
      {SOCIAL_LINKS?.map(({ url, icon }, index) => {
        return (
          <Link key={index} href={url} className="hover:text-brand-ui-primary">
            <Icon size={25} icon={icon} />
          </Link>
        )
      })}
    </div>
  )
}

const NavImageItem = ({ title, src, alt, url }: NavbarImageProps) => {
  return (
    <Link href={url} className="flex flex-col gap-4 group">
      <div
        className="h-40 overflow-hidden bg-center bg-cover border rounded-3xl border-ui-main-100"
        style={{
          backgroundImage: `url(${src})`,
        }}
        data-image={alt}
      ></div>
      <NavSectionTitle
        title={title}
        className="group-hover:text-brand-ui-primary"
      />
    </Link>
  )
}

const NavMenuSection = ({ title, options }: NavbarMenuProps) => {
  return (
    <div className="flex flex-col gap-4">
      <NavSectionTitle title={title} />
      <div className="flex flex-col gap-4">
        {options?.map(({ title, url }, index) => {
          return (
            <Link
              key={index}
              href={url}
              className="duration-200 hover:text-brand-ui-primary"
            >
              {title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const NavEmbedItem = ({ title, embed }: NavEmbedProps) => {
  return (
    <div className="flex flex-col gap-4 group">
      <div className="overflow-hidden bg-center bg-cover border border-gray-100 rounded-3xl h-60">
        <div dangerouslySetInnerHTML={{ __html: embed }}></div>
      </div>
      <NavSectionTitle
        title={title}
        className="group-hover:text-brand-ui-primary"
      />
    </div>
  )
}

const NavOption = (option: NavOptionProps): JSX.Element | null => {
  if ('options' in option) {
    return <NavMenuSection {...option} />
  }

  if ('src' in option) {
    return <NavImageItem {...option} />
  }

  if ('embed' in option) {
    return <NavEmbedItem {...option} />
  }

  if (!('src' in option) && !('options' in option)) {
    return null
  }

  return null
}

const NavSectionDesktop = (section: MenuSectionProps) => {
  const { title } = section
  const options = 'options' in section ? section?.options : []
  const url: string = 'url' in section ? section?.url : ''
  const hasEmbed = 'embed' in section ? section.embed : null
  const size = section.size ?? 'medium'

  const classBySize = POPOVER_CLASSES[size]
  const navbarClassBySize = ['medium', 'large'].includes(size)
    ? 'grid justify-between grid-cols-4 gap-10'
    : 'grid justify-between grid-cols-1 gap-10'

  const Title = ({ title, open }: any) => {
    return (
      <span
        className={`text-lg duration-200  hover:text-brand-ui-primary ${
          open ? 'text-brand-ui-primary' : 'text-brand-dark'
        }`}
      >
        {title}
      </span>
    )
  }

  const Navbar = () => {
    return (
      <div className={navbarClassBySize}>
        {hasEmbed ? (
          <>embed</>
        ) : (
          options?.map((option, index) => <NavOption key={index} {...option} />)
        )}
      </div>
    )
  }

  if (url.length > 0) {
    return (
      <Link href={url}>
        <Title title={title} />
      </Link>
    )
  }

  return (
    <>
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button className="outline-none">
              <span
                className={`text-lg duration-200  hover:text-brand-ui-primary ${
                  open ? 'text-brand-ui-primary' : 'text-brand-dark'
                }`}
              >
                {title}
              </span>
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
              <Popover.Panel className={`absolute z-10 ${classBySize}`}>
                <div className="overflow-hidden border shadow-lg rounded-3xl">
                  <div className="relative grid gap-8 px-10 py-8 bg-ui-secondary-100">
                    <Navbar />
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  )
}

const NavSectionMobile = ({
  menuSections,
}: {
  menuSections: MenuSectionProps[]
}) => {
  const Title = ({ title, open, ...props }: any) => {
    return (
      <div className="flex items-center justify-between" {...props}>
        <span
          className={`text-2xl font-bold duration-200  hover:text-brand-ui-primary ${
            open ? 'text-brand-ui-primary' : 'text-brand-dark'
          }`}
        >
          {title}
        </span>
        <Icon icon={open ? MinusIcon : PlusIcon} size={30} />
      </div>
    )
  }

  const MenuItem = (section: MenuSectionProps) => {
    const [open, setOpen] = useState(false)
    const { title } = section
    const options = 'options' in section ? section?.options : []
    const url: string = 'url' in section ? section?.url : ''
    const hasEmbed = 'embed' in section ? section.embed : null

    if (url.length > 0 || hasEmbed) {
      return (
        <Link href={url}>
          <Title title={title} />
        </Link>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        {title?.length > 0 && (
          <Title title={title} open={open} onClick={() => setOpen(!open)} />
        )}
        {open && (
          <div className="flex flex-col gap-6 mb-14">
            {options?.map((option, index) => {
              const SectionTitle = () => {
                if (option.title?.length === 0) return null
                return 'url' in option && option.url ? (
                  <Link href={option.url}>
                    <div className="font-bold">{option.title}</div>
                  </Link>
                ) : (
                  <div className="font-bold">{option.title}</div>
                )
              }

              return (
                <div className="flex flex-col" key={index}>
                  <SectionTitle />
                  <div className="flex flex-col gap-4">
                    {'options' in option &&
                      option.options?.map(({ title, url }, index) => {
                        return (
                          <Link
                            key={index}
                            href={url}
                            className="duration-200 hover:text-brand-ui-primary"
                          >
                            {title}
                          </Link>
                        )
                      })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      {menuSections?.map((menu, index) => (
        <MenuItem key={index} {...menu} />
      ))}
    </div>
  )
}

export const HeaderNav = ({
  menuSections,
  actions,
  logo,
  extraClass,
}: NavbarProps) => {
  const [menuExpanded, setMenuExpanded] = useState(false)
  const logoUrl = logo.url || '#'
  const logoImageSrc = logo.src || LogoUrl

  useEffect(() => {
    const html: HTMLElement = document.querySelector('html')!
    // disable scroll of contents when menu mobile is expanded
    const activeClasses = ['fixed', 'h-full', 'inset-0']
    if (html && menuExpanded) {
      activeClasses.forEach((activeClass) => html.classList.add(activeClass))
    } else if (html.classList.contains(activeClasses[0])) {
      activeClasses.forEach((activeClass) => html.classList.remove(activeClass))
    }
  }, [menuExpanded])

  return (
    <div className={`relative ${menuExpanded ? 'fixed top-0' : ''}`}>
      <div className="flex lg:grid lg:grid-cols-[minmax(200px,_1fr)_2fr_minmax(200px,_1fr)] items-center justify-between h-24 w-ful gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="block lg:hidden">
              <Icon
                size={30}
                icon={menuExpanded ? CloseIcon : MenuIcon}
                onClick={() => setMenuExpanded(!menuExpanded)}
              />
            </div>
            <Link href={logoUrl}>
              <img src={logoImageSrc} alt="logo" className="h-5 lg:h-6" />
            </Link>
          </div>
        </div>
        <div className="items-center justify-center hidden gap-12 lg:flex">
          {menuSections?.map((menu, index) => (
            <NavSectionDesktop key={index} {...menu} />
          ))}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="hidden lg:block">
            <SocialIcons />
          </div>
          <div className="flex gap-2">
            {actions?.map(({ title, url, icon }, index) => {
              return (
                <Link href={url} key={index}>
                  <Button variant="outlined-primary" size="small">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold lg:text-base text-brand-ui-primary">
                        {title}
                      </span>
                      {icon && (
                        <Icon
                          className="text-brand-ui-primary"
                          icon={icon}
                          size={25}
                        />
                      )}
                    </div>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {menuExpanded && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-10 block overflow-scroll pb-20 top-24 lg:hidden ${
            extraClass?.mobile ?? ''
          }`}
        >
          <div className="flex flex-col gap-10">
            <NavSectionMobile menuSections={menuSections} />
            <SocialIcons />
          </div>
        </div>
      )}
    </div>
  )
}

export default HeaderNav
