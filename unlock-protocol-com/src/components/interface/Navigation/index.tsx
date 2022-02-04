import { Link } from '../../helpers/Link'
import { Popover, Transition } from '@headlessui/react'
import { Button } from '@unlock-protocol/ui'
import React, { Fragment, SVGProps } from 'react'
import { MdFormatListBulleted as BulletedListIcon } from 'react-icons/md'
import { FaHeartbeat as HeartBeatIcon } from 'react-icons/fa'
import { FiLifeBuoy as LifeBuoyIcon, FiCode as CodeIcon } from 'react-icons/fi'
import { IconType } from 'react-icons'

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
      <nav className="flex items-center justify-between max-w-screen-lg px-4 mx-auto">
        <div>
          <Link aria-label="Unlock">
            <UnlockNavigationLogo />
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
          <Button> Connect </Button>
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

function UnlockNavigationLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="81"
      height="18"
      viewBox="0 0 81 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18.2779 6.59502V8.47914H0V6.59502H18.2779ZM13.097 0.0976562H16.2669V11.5565C16.2669 12.8126 15.9715 13.9174 15.3807 14.8709C14.7899 15.8244 13.9633 16.5694 12.901 17.1061C11.8387 17.6371 10.5975 17.9026 9.17729 17.9026C7.75709 17.9026 6.51585 17.6371 5.45354 17.1061C4.39124 16.5694 3.56468 15.8244 2.97388 14.8709C2.38876 13.9174 2.0962 12.8126 2.0962 11.5565V0.0976562H5.25756V11.2911C5.25756 12.0219 5.41662 12.6727 5.73474 13.2437C6.05854 13.8146 6.51301 14.2628 7.09812 14.5883C7.68893 14.908 8.38198 15.0679 9.17729 15.0679C9.97828 15.0679 10.6713 14.908 11.2565 14.5883C11.8473 14.2628 12.3017 13.8146 12.6198 13.2437C12.938 12.6727 13.097 12.0219 13.097 11.2911V0.0976562Z"
        fill="black"
      />
      <path
        d="M23.3318 9.92935V17.6371H20.2471V4.48252H23.1954V6.71778H23.3488C23.6499 5.98126 24.1299 5.39604 24.7889 4.96212C25.4535 4.5282 26.2744 4.31124 27.2515 4.31124C28.1547 4.31124 28.9415 4.50536 29.6118 4.8936C30.2879 5.28185 30.8105 5.84423 31.1797 6.58075C31.5547 7.31727 31.7393 8.2108 31.7336 9.26134V17.6371H28.649V9.74094C28.649 8.86168 28.4217 8.17369 27.9673 7.67697C27.5185 7.18024 26.8964 6.93188 26.1011 6.93188C25.5615 6.93188 25.0814 7.05178 24.6611 7.29158C24.2464 7.52566 23.9197 7.86538 23.6811 8.31071C23.4482 8.75605 23.3318 9.2956 23.3318 9.92935Z"
        fill="black"
      />
      <path
        d="M37.7033 0.0976562V17.6371H34.6186V0.0976562H37.7033Z"
        fill="black"
      />
      <path
        d="M46.3337 17.894C45.0555 17.894 43.9478 17.6114 43.0104 17.0462C42.0731 16.481 41.346 15.6902 40.829 14.6739C40.3177 13.6576 40.0621 12.4701 40.0621 11.1112C40.0621 9.75235 40.3177 8.56193 40.829 7.53994C41.346 6.51794 42.0731 5.72433 43.0104 5.15909C43.9478 4.59386 45.0555 4.31124 46.3337 4.31124C47.6119 4.31124 48.7196 4.59386 49.6569 5.15909C50.5943 5.72433 51.3186 6.51794 51.8298 7.53994C52.3468 8.56193 52.6053 9.75235 52.6053 11.1112C52.6053 12.4701 52.3468 13.6576 51.8298 14.6739C51.3186 15.6902 50.5943 16.481 49.6569 17.0462C48.7196 17.6114 47.6119 17.894 46.3337 17.894ZM46.3507 15.4104C47.0438 15.4104 47.6232 15.2192 48.089 14.8366C48.5549 14.4484 48.9014 13.9288 49.1286 13.2779C49.3615 12.6271 49.478 11.902 49.478 11.1026C49.478 10.2976 49.3615 9.56965 49.1286 8.91877C48.9014 8.26219 48.5549 7.73977 48.089 7.35153C47.6232 6.96328 47.0438 6.76916 46.3507 6.76916C45.6406 6.76916 45.0498 6.96328 44.5783 7.35153C44.1125 7.73977 43.7631 8.26219 43.5302 8.91877C43.303 9.56965 43.1894 10.2976 43.1894 11.1026C43.1894 11.902 43.303 12.6271 43.5302 13.2779C43.7631 13.9288 44.1125 14.4484 44.5783 14.8366C45.0498 15.2192 45.6406 15.4104 46.3507 15.4104Z"
        fill="black"
      />
      <path
        d="M60.6818 17.894C59.3752 17.894 58.2533 17.6057 57.3159 17.0291C56.3843 16.4524 55.6657 15.6559 55.1601 14.6397C54.6602 13.6177 54.4102 12.4415 54.4102 11.1112C54.4102 9.77519 54.6658 8.59619 55.1771 7.57419C55.6884 6.54649 56.4098 5.74717 57.3415 5.17622C58.2788 4.59957 59.3866 4.31124 60.6647 4.31124C61.727 4.31124 62.6672 4.50821 63.4852 4.90217C64.309 5.29041 64.9651 5.84137 65.4536 6.55506C65.9422 7.26303 66.2205 8.0909 66.2887 9.03867H63.3404C63.2211 8.40492 62.9371 7.8768 62.4883 7.4543C62.0452 7.02609 61.4515 6.81198 60.7074 6.81198C60.0768 6.81198 59.5229 6.98327 59.0457 7.32583C58.5685 7.66269 58.1965 8.14799 57.9295 8.78175C57.6681 9.4155 57.5375 10.1749 57.5375 11.0598C57.5375 11.9562 57.6681 12.727 57.9295 13.3722C58.1908 14.0116 58.5572 14.5055 59.0287 14.8538C59.5059 15.1963 60.0654 15.3676 60.7074 15.3676C61.1618 15.3676 61.568 15.282 61.9259 15.1107C62.2894 14.9337 62.5934 14.6796 62.8376 14.3485C63.0819 14.0173 63.2495 13.6148 63.3404 13.1409H66.2887C66.2149 14.0716 65.9422 14.8966 65.4707 15.616C64.9992 16.3297 64.3573 16.8892 63.5449 17.2946C62.7326 17.6942 61.7782 17.894 60.6818 17.894Z"
        fill="black"
      />
      <path
        d="M71.1407 13.5092L71.1322 9.76663H71.6264L76.3301 4.48252H79.9345L74.1487 10.9571H73.5096L71.1407 13.5092ZM68.3287 17.6371V0.0976562H71.4134V17.6371H68.3287ZM76.5431 17.6371L72.2825 11.6508L74.3617 9.46688L80.2328 17.6371H76.5431Z"
        fill="black"
      />
    </svg>
  )
}
