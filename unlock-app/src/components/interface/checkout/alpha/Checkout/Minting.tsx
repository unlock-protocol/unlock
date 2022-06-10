import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutStateDispatch } from '../useCheckoutState'
import { PaywallConfig } from '~/unlockTypes'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Shell } from '../Shell'
import { Button, Icon } from '@unlock-protocol/ui'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import mintingAnimation from '~/animations/minting.json'
import mintedAnimation from '~/animations/minted.json'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  dispatch: CheckoutStateDispatch
  onClose(): void
  state: CheckoutState
}

function AnimationContent({
  status,
}: {
  status: Exclude<CheckoutState['mint'], undefined>['status']
}) {
  switch (status) {
    case 'PROCESSING':
      return (
        <Lottie
          className="w-40 h-40"
          loop={true}
          animationData={mintingAnimation}
        />
      )
    case 'FINISHED':
      return (
        <Lottie
          className="w-40 h-40"
          loop={true}
          animationData={mintedAnimation}
        />
      )
    default:
      return null
  }
}

export function Minting({
  injectedProvider,
  onClose,
  state: { mint, lock },
}: Props) {
  const { account, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const config = useConfig()
  const processing = mint!.status === 'PROCESSING'

  return (
    <>
      <Shell.Content>
        <div className="space-y-6 justify-center grid">
          <AnimationContent status={mint!.status} />
          <a
            href={config.networks[lock!.network].explorer.urls.transaction(
              mint!.value
            )}
            className="text-sm inline-flex items-center gap-2 text-brand-ui-primary hover:opacity-75"
          >
            See in block explorer <Icon icon={ExternalLinkIcon} size="small" />
          </a>
        </div>
      </Shell.Content>
      <Shell.Footer>
        <div className="space-y-4">
          <Button
            disabled={!account || processing}
            loading={processing}
            onClick={onClose}
            className="w-full"
          >
            {processing ? 'Minting your membership' : 'Return to site'}
          </Button>
          {account ? (
            <LoggedIn account={account} onDisconnect={() => deAuthenticate()} />
          ) : (
            <LoggedOut
              authenticateWithProvider={authenticateWithProvider}
              onUnlockAccount={() => {}}
            />
          )}
        </div>
      </Shell.Footer>
    </>
  )
}
