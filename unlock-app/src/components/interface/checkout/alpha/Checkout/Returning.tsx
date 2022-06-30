import { Button, Icon } from '@unlock-protocol/ui'
import { useSelector } from '@xstate/react'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { Shell } from '../Shell'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import unlockedAnimation from '~/animations/unlocked.json'
import { useConfig } from '~/utils/withConfig'

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
  const lock = useSelector(checkoutService, (state) => state.context.lock)
  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head checkoutService={checkoutService} />
      <main className="p-4 overflow-auto h-64 sm:h-72">
        <div className="space-y-6 justify-items-center grid">
          <div className="grid justify-items-center">
            <Lottie
              className="w-40 h-40"
              loop
              animationData={unlockedAnimation}
            />
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
