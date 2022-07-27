import { CheckoutService } from './checkoutMachine'
import { networkToLocksMap } from '~/utils/paywallConfig'
import { useConfig } from '~/utils/withConfig'
import { Connected } from '../Connected'
import { Lock } from '../Lock'
import { useActor } from '@xstate/react'
import { CheckoutHead, CheckoutTransition, CloseButton } from '../Shell'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useState } from 'react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ProgressCircleIcon, ProgressFinishIcon } from '../Progress'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function Select({ checkoutService, injectedProvider, onClose }: Props) {
  const [state, send] = useActor(checkoutService)
  const { paywallConfig } = state.context
  const config = useConfig()
  const { account } = useAuth()
  const [isLockLoading, setIsLockLoading] = useState('')
  const web3Service = useWeb3Service()
  const networkToLocks = networkToLocksMap(paywallConfig)
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)

  return (
    <CheckoutTransition>
      <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] max-h-[42rem]">
        <div className="flex items-center justify-end p-6">
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
              <ProgressCircleIcon />
            </div>
            <h4 className="text-sm"> {title}</h4>
          </div>
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
                    loading={isLockLoading === address}
                    network={Number(network)}
                    key={address}
                    onSelect={async (lock) => {
                      send({
                        type: 'SELECT_LOCK',
                        lock,
                      })
                      if (account && lock) {
                        setIsLockLoading(lock.address)
                        const existingMember = await web3Service.getHasValidKey(
                          lock.address,
                          account,
                          lock.network
                        )
                        setIsLockLoading('')
                        if (existingMember) {
                          send('EXISTING_MEMBER')
                          return
                        }
                      }
                      send('CONTINUE')
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
      </div>
    </CheckoutTransition>
  )
}
