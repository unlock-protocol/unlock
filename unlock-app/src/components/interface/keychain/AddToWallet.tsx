import { Button } from '@unlock-protocol/ui'
import { AddToDeviceWallet } from './AddToPhoneWallet'
import Image from 'next/image'
import { FaWallet as WalletIcon } from 'react-icons/fa'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Platform } from '~/services/ethpass'
import { isAndroid, isIOS } from 'react-device-detect'
import * as Tooltip from '@radix-ui/react-tooltip'

interface AddToWallet {
  network: number
  lockAddress: string
  tokenId: string
  tokenName: string
}

export const AddToWallet = ({
  network,
  lockAddress,
  tokenId,
  tokenName,
}: AddToWallet) => {
  const { watchAsset } = useAuth()

  const addToWallet = () => {
    watchAsset({
      network,
      address: lockAddress,
      tokenId,
    })
  }

  return (
    <div className="w-full h-1/5 bg-gray-200 flex items-center justify-between rounded-md px-4 py-1 bg-opacity-60">
      <p className="font-bold">Add to Wallet</p>
      <div className="flex items-center justify-around w-1/2 h-full">
        <Tooltip.Provider delayDuration={100}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className="flex justify-center items-center p-2 w-10 h-10 text-xs rounded-full bg-white"
                onClick={addToWallet}
              >
                <WalletIcon className="w-full h-full" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                sideOffset={5}
              >
                Crypto Wallet
                <Tooltip.Arrow className="fill-white" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          {!isIOS && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>
                  <AddToDeviceWallet
                    className="p-2 w-10 h-10 text-xs rounded-full bg-white"
                    size="medium"
                    variant="secondary"
                    platform={Platform.GOOGLE}
                    as={Button}
                    network={network}
                    lockAddress={lockAddress}
                    tokenId={tokenId}
                    name={tokenName}
                    handlePassUrl={(url: string) => {
                      window.location.assign(url)
                    }}
                  >
                    <Image
                      className="w-full h-full"
                      width="20"
                      height="20"
                      alt="Google Wallet"
                      src={`/images/illustrations/google-wallet.svg`}
                    />
                  </AddToDeviceWallet>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                  sideOffset={5}
                >
                  Google Wallet
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}
          {!isAndroid && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>
                  <AddToDeviceWallet
                    className="p-2  w-10 h-10 text-xs rounded-full bg-white"
                    platform={Platform.APPLE}
                    size="medium"
                    variant="secondary"
                    as={Button}
                    network={network}
                    lockAddress={lockAddress}
                    tokenId={tokenId}
                    name={tokenName}
                    handlePassUrl={(url: string) => {
                      window.location.assign(url)
                    }}
                  >
                    <Image
                      className="w-full h-full"
                      width="20"
                      height="20"
                      alt="Apple Wallet"
                      src={`/images/illustrations/apple-wallet.svg`}
                    />
                  </AddToDeviceWallet>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                  sideOffset={5}
                >
                  Apple Wallet
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}
        </Tooltip.Provider>
      </div>
    </div>
  )
}
