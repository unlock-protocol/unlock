import { CheckoutService } from './checkoutMachine'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { Lock } from '../Lock'
import { useActor } from '@xstate/react'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Select({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { paywallConfig } = state.context
  const config = useConfig()
  const networkToLocks = networkToLocksMap(paywallConfig)
  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
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
          service={checkoutService}
          injectedProvider={injectedProvider}
        />
      </footer>
    </div>
  )
}
