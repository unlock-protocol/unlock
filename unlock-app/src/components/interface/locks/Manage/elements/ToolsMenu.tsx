'use client'

import { useState, Fragment } from 'react'
import { Button, Icon } from '@unlock-protocol/ui'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { TbTools as ToolsIcon } from 'react-icons/tb'
import { CgWebsite as WebsiteIcon } from 'react-icons/cg'
import { FaRegEdit as EditIcon } from 'react-icons/fa'
import { BiRightArrow as RightArrowIcon } from 'react-icons/bi'
import { TbPlant as PlantIcon } from 'react-icons/tb'
import { useLockManager } from '~/hooks/useLockManager'
import { AirdropKeysDrawer } from '~/components/interface/members/airdrop/AirdropDrawer'
import PopoverItem from './PopoverItem'

interface ToolsMenuProps {
  lockAddress: string
  network: number
}

const ToolsMenu = ({ lockAddress, network }: ToolsMenuProps) => {
  const [airdropKeys, setAirdropKeys] = useState(false)
  const DEMO_URL = `/demo?network=${network}&lock=${lockAddress}`
  const metadataPageUrl = `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
  const checkoutLink = '/locks/checkout-url'

  const { isManager } = useLockManager({
    lockAddress,
    network: network!,
  })

  return (
    <>
      <AirdropKeysDrawer
        isOpen={airdropKeys}
        setIsOpen={setAirdropKeys}
        locks={{
          [lockAddress]: {
            network: network,
          },
        }}
      />

      <div className="">
        <Popover className="relative">
          <>
            <Popover.Button className="outline-none ring-0">
              <Button as="div" role="button">
                <div className="flex items-center gap-2">
                  <Icon icon={ToolsIcon} size={20} />
                  <span>Tools</span>
                </div>
              </Button>
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
              <Popover.Panel className="absolute right-0 z-[5] max-w-sm px-4 mt-3 transform w-80">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid gap-8 bg-white p-7">
                    <a href={DEMO_URL} target="_blank" rel="noreferrer">
                      <PopoverItem
                        label="Preview"
                        description="Preview the checkout experience"
                        icon={WebsiteIcon}
                      />
                    </a>
                    <Link href={checkoutLink} className="text-left">
                      <PopoverItem
                        label="Checkout URLs"
                        description="Customize your member's purchase journey"
                        icon={RightArrowIcon}
                      />
                    </Link>
                    <PopoverItem
                      label="Airdrop Keys"
                      description="Send memberships to your members"
                      onClick={() => setAirdropKeys(!airdropKeys)}
                      icon={PlantIcon}
                    />
                    {isManager && (
                      <>
                        <Link href={metadataPageUrl}>
                          <PopoverItem
                            label="Edit NFT Properties"
                            description="Edit & update NFT metadata that will display in platforms such as Opensea"
                            icon={EditIcon}
                          />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        </Popover>
      </div>
    </>
  )
}

export default ToolsMenu
