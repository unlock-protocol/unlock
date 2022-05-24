import type { Lock as LockType } from '@unlock-protocol/types'
import { PaywallConfig } from '~/unlockTypes'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { Lock } from '../Lock'
import { Shell } from '../Shell'

interface Props {
  paywallConfig: PaywallConfig
  lock: LockType
}

export function Quantity({ paywallConfig, lock }: Props) {
  const networkToLocks = networkToLocksMap(paywallConfig)
  const config = useConfig()
  return (
    <>
      <Shell.Content>
        {Object.entries(networkToLocks).map(([network, locks]) => (
          <section key={network}>
            <header>
              <div>
                <h3 className="font-bold text-brand-ui-primary text-base">
                  {config.networks[network].name}
                </h3>
                <p className="text-sm text-brand-gray">
                  The most popular network{' '}
                </p>
              </div>
            </header>
            <div>
              {locks.map(({ name, address }) => (
                <Lock
                  name={name}
                  address={address}
                  network={Number(network)}
                  key={address}
                />
              ))}
            </div>
          </section>
        ))}
      </Shell.Content>
    </>
  )
}
