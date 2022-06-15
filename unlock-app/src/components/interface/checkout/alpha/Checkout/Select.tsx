import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { CheckoutState, CheckoutSend, LockState } from '../checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Lock } from '../Lock'
import { Shell } from '../Shell'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

export function Select({ paywallConfig, send, injectedProvider }: Props) {
  const config = useConfig()
  const { account, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const networkToLocks = networkToLocksMap(paywallConfig)
  return (
    <>
      <Shell.Content>
        {Object.entries(networkToLocks).map(([network, locks]) => (
          <section key={network}>
            <header>
              <h3 className="font-bold text-brand-ui-primary text-lg">
                {config.networks[network].name}
              </h3>
              <p className="text-sm text-brand-gray">
                The most popular network{' '}
              </p>
            </header>
            <div className="grid space-y-4 py-4">
              {locks.map(({ name, address }) => (
                <Lock
                  name={name!}
                  address={address}
                  network={Number(network)}
                  key={address}
                  onSelect={(lock) => {
                    send({
                      type: 'SELECT_LOCK',
                      lock,
                    })
                  }}
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
            onUnlockAccount={() => {}}
          />
        )}
      </Shell.Footer>
    </>
  )
}
