import { Button, Icon } from '@unlock-protocol/ui'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import {
  BackButton,
  CheckoutHead,
  CheckoutTransition,
  CloseButton,
} from '../Shell'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import unlockedAnimation from '~/animations/unlocked.json'
import { useConfig } from '~/utils/withConfig'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { ProgressCircleIcon, ProgressFinishedIcon } from '../Progress'
import { useActor } from '@xstate/react'

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
  const { paywallConfig, lock } = state.context
  const { title, iconURL, description } =
    useCheckoutHeadContent(checkoutService)
  return (
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
        <div className="flex items-center justify-between p-6">
          <BackButton onClick={() => send('BACK')} />
          <CloseButton onClick={() => onClose()} />
        </div>
        <CheckoutHead
          title={paywallConfig.title}
          iconURL={iconURL}
          description={description}
        />
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
            <h4 className="text-sm ">{title}</h4>
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
              See in block explorer{' '}
              <Icon key="external-link" icon={ExternalLinkIcon} size="small" />
            </a>
          </div>
        </main>
        <footer className="p-6 border-t grid items-center">
          <Connected
            injectedProvider={injectedProvider}
            service={checkoutService}
          >
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
          </Connected>
        </footer>
      </div>
    </CheckoutTransition>
  )
}
