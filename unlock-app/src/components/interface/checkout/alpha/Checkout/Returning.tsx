import { Button, Icon } from '@unlock-protocol/ui'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import unlockedAnimation from '~/animations/unlocked.json'
import { useConfig } from '~/utils/withConfig'
import { ProgressCircleIcon, ProgressFinishedIcon } from '../Progress'
import { useActor } from '@xstate/react'
import { Fragment, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { PoweredByUnlock } from '../PoweredByUnlock'

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

  const { paywallConfig, lock, messageToSign: signedMessage } = state.context
  const { account, signMessage } = useAuth()
  const [hasMessageToSign, setHasMessageToSign] = useState(
    !signedMessage && paywallConfig.messageToSign
  )
  const [isSigningMessage, setIsSigningMessage] = useState(false)

  const onSign = async () => {
    try {
      setIsSigningMessage(true)
      const signature = await signMessage(paywallConfig.messageToSign!)
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

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <div className="flex items-center gap-0.5">
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishedIcon />
          </div>
          <h4 className="text-sm"> You have it!</h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
      </div>
      <main className="px-6 py-2 overflow-auto h-full">
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          <Lottie
            className={'w-28 sm:w-36 h-28 sm:h-36'}
            animationData={unlockedAnimation}
          />
          <p className="font-bold text-lg text-brand-ui-primary">
            Voila! This is unlocked!
          </p>
          <a
            href={config.networks[lock!.network].explorer.urls.address(
              lock!.address
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm inline-flex items-center gap-2 text-brand-ui-primary hover:opacity-75"
          >
            See in the block explorer
            <Icon key="external-link" icon={ExternalLinkIcon} size="small" />
          </a>
        </div>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
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
              <div className="flex gap-4 justify-between">
                <Button
                  className="w-full"
                  onClick={() => checkoutService.send('MAKE_ANOTHER_PURCHASE')}
                >
                  Buy another
                </Button>
                <Button className="w-full" onClick={() => onClose()}>
                  Return
                </Button>
              </div>
            )}
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
