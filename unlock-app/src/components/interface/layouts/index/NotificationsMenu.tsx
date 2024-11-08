import { Menu, MenuButton, MenuItems, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useState } from 'react'
import { BiBell as BellIcon } from 'react-icons/bi'
import { Button } from '@unlock-protocol/ui'
import { PromptEmailLink } from '../../PromptEmailLink'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { usePathname } from 'next/navigation'
import { Modal } from '@unlock-protocol/ui'
import { LoginModal } from '@privy-io/react-auth'

interface NotificationAction {
  label: string
  onClick: () => void
}

interface NotificationProps {
  id: string
  content: ReactNode
  action?: NotificationAction
  timestamp: Date
}

export function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { account, email } = useAuthenticate()
  const pathname = usePathname()

  if (!account) {
    return null
  }

  const notifications: NotificationProps[] = []

  /*
    Only show email prompt notification if:
    1. User connected
    2. User doesn't have an email
    3. Not on checkout or demo pages
  */
  if (!email && !['/checkout', '/demo'].includes(pathname)) {
    notifications.push({
      id: '1',
      content: <PromptEmailLink setModalOpen={setShowModal} />,
      timestamp: new Date(),
    })
  }

  return (
    <>
      <Menu as="div" className="relative mr-4 z-10">
        {({ open }) => (
          <>
            <MenuButton as={Fragment}>
              <Button
                variant="borderless"
                aria-label="Notifications"
                className="relative md:static"
                onClick={() => setIsOpen(!isOpen)}
              >
                <BellIcon className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </MenuButton>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems
                static
                className={`absolute right-1/2 translate-x-1/2 mt-2 w-80 ${
                  notifications.length < 3 ? 'h-auto max-h-48' : 'h-96'
                } origin-top rounded-md divide-y divide-gray-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto`}
              >
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id}>
                        <div className="rounded-md px-4 py-3 cursor-pointer hover:bg-gray-100">
                          {notification.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>

      {showModal && (
        <Modal isOpen={showModal} setIsOpen={setShowModal} size="small">
          <div onClick={(e) => e.stopPropagation()}>
            <LoginModal open={true} />
          </div>
        </Modal>
      )}
    </>
  )
}
