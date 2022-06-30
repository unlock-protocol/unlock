import { Button, Icon } from '@unlock-protocol/ui'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { Shell } from '../Shell'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import unlockedAnimation from '~/animations/unlocked.json'
import { useConfig } from '~/utils/withConfig'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import {
  ProgressCircleIcon,
  ProgressFinishedIcon,
  ProgressFinishIcon,
} from '../Progress'
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
  const [state] = useActor(checkoutService)
  const { paywallConfig, lock } = state.context
  const { title, iconURL, description } =
    useCheckoutHeadContent(checkoutService)

  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head title={title} iconURL={iconURL} description={description} />
      <div className="flex px-6 py-6 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <div className="flex items-center gap-0.5">
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
      <main className="p-4 overflow-auto h-64 sm:h-72">
        <div className="space-y-6 justify-items-center grid">
          <div className="grid justify-items-center">
            <Lottie className="w-40 h-40" animationData={unlockedAnimation} />
            <p className="font-bold text-xl text-brand-ui-primary">
              Voila! This is unlocked!
            </p>
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outlined-primary"
              onClick={() => checkoutService.send('MAKE_ANOTHER_PURCHASE')}
            >
              Buy another
            </Button>
            <Button onClick={() => onClose()}>Return to site</Button>
          </div>
        </Connected>
      </footer>
    </Shell.Root>
  )
}
