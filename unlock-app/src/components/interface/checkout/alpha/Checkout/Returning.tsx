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

  const stepItems: StepItem[] = [
    {
      id: 1,
      name: 'Select lock',
      to: 'SELECT',
    },
    {
      id: 2,
      name: 'You have it',
    },
  ]

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
              <div className="flex justify-between gap-4">
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
