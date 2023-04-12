import { Button, Icon } from '@unlock-protocol/ui'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import unlockedAnimation from '~/animations/unlocked.json'
import { useConfig } from '~/utils/withConfig'
import { StepItem, Stepper } from '../Stepper'
import { useActor } from '@xstate/react'
import { Fragment, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { AddToDeviceWallet } from '../../keychain/AddToPhoneWallet'
import Image from 'next/image'
import { isAndroid, isIOS } from 'react-device-detect'
import { isEthPassSupported, Platform } from '~/services/ethpass'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function Returning({
  checkoutService,
  injectedProvider,
  onClose,
}: Props) {
  const config = useConfig()
  const [state, send] = useActor(checkoutService)
  const web3Service = useWeb3Service()
  const { paywallConfig, lock, messageToSign: signedMessage } = state.context
  const { account, getWalletService } = useAuth()
  const [hasMessageToSign, setHasMessageToSign] = useState(
    !signedMessage && paywallConfig.messageToSign
  )
  const [isSigningMessage, setIsSigningMessage] = useState(false)

  const onSign = async () => {
    try {
      setIsSigningMessage(true)
      const walletService = await getWalletService()

      const signature = await walletService.signMessage(
        paywallConfig.messageToSign!,
        'personal_sign'
      )
      setIsSigningMessage(false)
      send({
        type: 'SIGN_MESSAGE',
        signature,
        address: account!,
      })
      setHasMessageToSign(false)
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsSigningMessage(false)
    }
  }

  const stepItems: StepItem[] = [
    {
      id: 1,
      name: 'Select',
      to: 'SELECT',
    },
    {
      id: 2,
      name: 'You have it',
    },
  ]

  const { data: tokenId } = useQuery(
    ['userTokenId', account, lock, web3Service],
    async () => {
      return web3Service.getTokenIdForOwner(
        lock!.address,
        account!,
        lock!.network
      )
    },
    {
      enabled: !!(account && lock),
    }
  )

  return (
    <Fragment>
      <Stepper position={2} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <Lottie
            className={'w-28 sm:w-36 h-28 sm:h-36'}
            animationData={unlockedAnimation}
          />
          <p className="text-lg font-bold text-brand-ui-primary">
            Voila! This is unlocked!
          </p>
          <a
            href={config.networks[lock!.network].explorer.urls.address(
              lock!.address
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
          >
            See in the block explorer
            <Icon key="external-link" icon={ExternalLinkIcon} size="small" />
          </a>
          {tokenId && isEthPassSupported(lock!.network) && (
            <ul className="grid h-12 grid-cols-2 gap-3 pt-4">
              {!isIOS && tokenId && (
                <li className="">
                  <AddToDeviceWallet
                    className="w-full px-2 h-8 text-xs grid grid-cols-[20px_1fr] rounded-md bg-black text-white"
                    iconLeft={
                      <Image
                        width="20"
                        height="20"
                        alt="Google Wallet"
                        src={`/images/illustrations/google-wallet.svg`}
                      />
                    }
                    size="small"
                    variant="secondary"
                    platform={Platform.GOOGLE}
                    as={Button}
                    network={lock!.network}
                    lockAddress={lock!.address}
                    tokenId={tokenId}
                    name={lock!.name}
                    handlePassUrl={(url: string) => {
                      window.location.assign(url)
                    }}
                  >
                    Add to Google Wallet
                  </AddToDeviceWallet>
                </li>
              )}
              {!isAndroid && tokenId && (
                <li className="">
                  <AddToDeviceWallet
                    className="w-full px-2 h-8 text-xs grid grid-cols-[20px_1fr] rounded-md bg-black text-white"
                    platform={Platform.APPLE}
                    size="small"
                    variant="secondary"
                    as={Button}
                    iconLeft={
                      <Image
                        className="justify-self-left"
                        width="20"
                        height="20"
                        alt="Apple Wallet"
                        src={`/images/illustrations/apple-wallet.svg`}
                      />
                    }
                    network={lock!.network}
                    lockAddress={lock!.address}
                    tokenId={tokenId}
                    name={lock!.name}
                    handlePassUrl={(url: string) => {
                      window.location.assign(url)
                    }}
                  >
                    Add to Apple Wallet
                  </AddToDeviceWallet>
                </li>
              )}
            </ul>
          )}
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <div>
            {hasMessageToSign ? (
              <Button
                disabled={isSigningMessage}
                loading={isSigningMessage}
                onClick={onSign}
                className="w-full"
              >
                Sign message
              </Button>
            ) : (
              <div
                className={`gap-4 ${
                  paywallConfig?.endingCallToAction
                    ? 'grid grid-cols-1'
                    : 'flex justify-between '
                }`}
              >
                <Button className="w-full" onClick={() => onClose()}>
                  {paywallConfig?.endingCallToAction || 'Return'}
                </Button>
                {!lock?.isSoldOut && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      checkoutService.send('MAKE_ANOTHER_PURCHASE')
                    }
                  >
                    Buy more
                  </Button>
                )}
              </div>
            )}
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
