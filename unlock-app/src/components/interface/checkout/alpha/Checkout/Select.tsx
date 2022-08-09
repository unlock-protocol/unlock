import { CheckoutService } from './checkoutMachine'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { Lock } from '../Lock'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
import { useQuery } from 'react-query'
import { Fragment } from 'react'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Select({ checkoutService, injectedProvider }: Props) {
  const [state, send] = useActor(checkoutService)
  const { paywallConfig } = state.context
  const config = useConfig()
  const { account } = useAuth()
  const web3Service = useWeb3Service()
  const networkToLocks = networkToLocksMap(paywallConfig)

  const { isLoading: isMembershipsLoading, data: memberships } = useQuery(
    ['memberships', account, JSON.stringify(paywallConfig)],
    async () => {
      const memberships = await Promise.all(
        Object.entries(paywallConfig.locks).map(async ([lock, { network }]) => {
          const valid = await web3Service.getHasValidKey(
            lock,
            account!,
            network || paywallConfig.network || 1
          )
          if (valid) {
            return lock
          }
        })
      )
      return memberships.filter((item) => item)
    },
    {
      enabled: !!account,
    }
  )

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <div className="flex items-center gap-0.5">
            <ProgressCircleIcon />
          </div>
        </div>
        <h4 className="text-sm"> Select lock</h4>
        <div className="border-t-4 w-full flex-1"></div>
        <div className="inline-flex items-center gap-1">
          <ProgressCircleIcon disabled />
          <ProgressCircleIcon disabled />
          <ProgressCircleIcon disabled />
          {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishIcon disabled />
        </div>
      </div>
      <main className="px-6 py-2 overflow-auto h-full">
        {Object.entries(networkToLocks).map(([network, locks]) => (
          <section key={network}>
            <header>
              <h3 className="font-bold text-brand-ui-primary text-lg">
                {config.networks[network].name}
              </h3>
              <p className="text-sm text-brand-gray">
                {config.networks[network].description}
              </p>
            </header>
            <div className="grid space-y-4 py-4">
              {locks.map(({ name, address, recurringPayments }) => (
                <Lock
                  name={name!}
                  recurring={recurringPayments}
                  address={address}
                  loading={isMembershipsLoading}
                  disabled={isMembershipsLoading}
                  network={Number(network)}
                  key={address}
                  onSelect={async (lock) => {
                    const existingMember = !!memberships?.includes(lock.address)
                    send({
                      type: 'SELECT_LOCK',
                      existingMember,
                      lock,
                    })
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
