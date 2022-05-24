import { Button } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { PaywallConfig } from '~/unlockTypes'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Lock } from '../Lock'
import { Shell } from '../Shell'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  navigate(page: string): void
}

export function Select({ paywallConfig, navigate, injectedProvider }: Props) {
  const config = useConfig()
  const { account, deAuthenticate, changeNetwork, network } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const networkToLocks = networkToLocksMap(paywallConfig)
  return (
    <>
      <Shell.Content>
        {Object.entries(networkToLocks).map(([network, locks]) => (
          <section key={network}>
            <header className="flex justify-between">
              <div>
                <h3 className="font-bold text-brand-ui-primary text-base">
                  {config.networks[network].name}
                </h3>
                <p className="text-sm text-brand-gray">
                  The most popular network{' '}
                </p>
              </div>
              <div>
                {}
                <Button
                  onClick={() => changeNetwork(config.networks[4])}
                  variant="outlined-primary"
                  size="tiny"
                >
                  Connect
                </Button>
              </div>
            </header>
            <div className="grid space-y-4 py-4">
              {locks.map(({ name, address }) => (
                <Lock
                  name={name}
                  address={address}
                  network={Number(network)}
                  key={address}
                  disabled="You need to connect your wallet"
                />
              ))}
            </div>
          </section>
        ))}
      </Shell.Content>
      <Shell.Footer>
        {account ? (
          <LoggedIn account={account} onDisconnect={() => deAuthenticate()} />
        ) : (
          <LoggedOut
            authenticateWithProvider={authenticateWithProvider}
            onUnlockAccount={() => navigate('signin')}
          />
        )}
      </Shell.Footer>
    </>
  )
}
