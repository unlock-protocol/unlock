import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { CheckoutState, CheckoutSend } from './checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { Lock } from '../Lock'

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
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-96">
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
      </main>
      <footer className="p-6 border-t grid items-center">
        <Connected
          account={account}
          onDisconnect={() => {
            deAuthenticate()
            send('DISCONNECT')
          }}
          authenticateWithProvider={authenticateWithProvider}
          onUnlockAccount={() => {
            send('UNLOCK_ACCOUNT')
          }}
        />
      </footer>
    </div>
  )
}
