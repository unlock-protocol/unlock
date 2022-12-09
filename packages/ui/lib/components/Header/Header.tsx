import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Button } from '../Button/Button'
import { SOCIAL_LINKS } from '../constants'
import { Icon } from '../Icon/Icon'
import { Link } from '../Link/Link'
import { HTMLProps } from 'react'
import { IconType } from 'react-icons'
import LogoUrl from './../../assets/unlock-footer-logo.svg'

interface NavbarMenuProps {
  title: string
  options: { label: string; url: string }[]
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

type MenuSectionProps =
  | {
      title: string
      options: NavOptionProps[]
    }
  | {
      title: string
      url: string
    }

interface ActionsProps {
  label: string
  url: string
  icon?: IconType
}
interface NavbarProps {
  menuSections: MenuSectionProps[]
  actions: ActionsProps[]
  logoUrl: string
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
    <div className="flex gap-6">
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
        className="overflow-hidden bg-center bg-cover rounded-3xl h-60"
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
        {options?.map(({ label, url }, index) => {
          return (
            <Link
              key={index}
              href={url}
              className="duration-200 hover:text-brand-ui-primary"
            >
              {label}
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

const NavSection = (section: MenuSectionProps) => {
  const { title } = section
  const options = 'options' in section ? section?.options : []
  const url: string = 'url' in section ? section?.url : ''
  const hasEmbed = 'embed' in section ? section.embed : null

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
      <div className="grid justify-between grid-cols-4 gap-10">
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
              <Popover.Panel className="absolute z-10 w-screen pt-4 transform -translate-x-1/2 left-1/2 sm:px-0">
                <div className="overflow-hidden border shadow-lg rounded-3xl">
                  <div className="relative grid gap-8 px-10 py-8 bg-white">
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

const Navbar = ({ menuSections, actions, logoUrl }: NavbarProps) => {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] items-center justify-between h-24 w-full">
      <Link href={logoUrl}>
        <img src={LogoUrl} alt="logo" className="h-10" />
      </Link>
      <div className="relative flex justify-center gap-12">
        {menuSections?.map((menu, index) => (
          <NavSection key={index} {...menu} />
        ))}
      </div>
      <div className="flex items-center justify-end gap-8">
        <SocialIcons />
        <div className="flex gap-2">
          {actions?.map(({ label, url, icon }, index) => {
            return (
              <Link href={url} key={index}>
                <Button variant="outlined-primary">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-brand-ui-primary">
                      {label}
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
  )
}

export default Navbar
