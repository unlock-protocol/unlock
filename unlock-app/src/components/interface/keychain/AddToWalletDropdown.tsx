import { Menu, Transition } from '@headlessui/react'
import { Button } from '@unlock-protocol/ui'
import { Fragment } from 'react'
import { TbTools as ToolsIcon } from 'react-icons/tb'
import { MenuButton } from './Key'
import { AddToDeviceWallet } from './AddToPhoneWallet'
import Image from 'next/image'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Platform } from '~/services/ethpass'
import { isAndroid, isIOS } from 'react-device-detect'

interface AddToWalletDropdownProps {
  network: number
  lockAddress: string
  tokenId: string
  tokenName: string
}

export const AddToWalletDropdown = ({
  network,
  lockAddress,
  tokenId,
  tokenName,
}: AddToWalletDropdownProps) => {
  const { watchAsset } = useAuth()

  const addToWallet = () => {
    watchAsset({
      network,
      address: lockAddress,
      tokenId,
    })
  }

  return (
    <div className="w-full flex items-end justify-end">
      <Menu as="div" className="relative inline-block text-left z-10">
        <Menu.Button as={Fragment}>
          <Button
            size="small"
            variant="outlined-primary"
            iconLeft={<ToolsIcon key="options" />}
          >
            Add to Wallet
          </Button>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg w-80 ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-1">
              <Menu.Item>
                {({ active, disabled }) => (
                  <MenuButton
                    disabled={disabled}
                    active={active}
                    onClick={addToWallet}
                  >
                    <WalletIcon />
                    Add to my crypto wallet
                  </MenuButton>
                )}
              </Menu.Item>
              {!isIOS && (
                <Menu.Item>
                  {({ active, disabled }) => (
                    <AddToDeviceWallet
                      platform={Platform.GOOGLE}
                      disabled={disabled}
                      active={active}
                      as={MenuButton}
                      network={network}
                      lockAddress={lockAddress}
                      tokenId={tokenId}
                      name={tokenName}
                      handlePassUrl={(url: string) => {
                        window.location.assign(url)
                      }}
                    >
                      <Image
                        width="16"
                        height="16"
                        alt="Google Wallet"
                        src={`/images/illustrations/google-wallet.svg`}
                      />
                      Add to my Google Wallet
                    </AddToDeviceWallet>
                  )}
                </Menu.Item>
              )}
              {!isAndroid && (
                <Menu.Item>
                  {({ active, disabled }) => (
                    <AddToDeviceWallet
                      platform={Platform.APPLE}
                      disabled={disabled}
                      active={active}
                      as={MenuButton}
                      network={network}
                      lockAddress={lockAddress}
                      tokenId={tokenId}
                      name={tokenName}
                      handlePassUrl={(url: string) => {
                        window.location.assign(url)
                      }}
                    >
                      <Image
                        width="16"
                        height="16"
                        alt="Apple Wallet"
                        src={`/images/illustrations/apple-wallet.svg`}
                      />
                      Add to my Apple Wallet
                    </AddToDeviceWallet>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
