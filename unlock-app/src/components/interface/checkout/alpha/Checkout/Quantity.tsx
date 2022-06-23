import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { useState } from 'react'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useActor } from '@xstate/react'
import { useAuth } from '~/contexts/AuthenticationContext'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Quantity({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const { network, isUnlockAccount, changeNetwork } = useAuth()
  const config = useConfig()
  const [quantityInput, setQuantityInput] = useState('1')
  const quantity = Number(quantityInput)
  const lock = state.context.lock!

  const { isLoading, data: fiatPricing } = useQuery(
    [quantityInput, lock.address, lock.network],
    async () => {
      const pricing = await getFiatPricing(
        config,
        lock.address,
        lock.network,
        quantity
      )
      return pricing
    }
  )

  const formattedData = getLockProps(
    {
      ...lock,
      fiatPricing,
    },
    lock!.network,
    config.networks[lock!.network].baseCurrencySymbol,
    lock!.name,
    quantity
  )

  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl"> {lock?.name}</h3>
          {!isLoading ? (
            <div className="grid">
              {fiatPricing.creditCardEnabled ? (
                <>
                  <p>${fiatPricing.usd.keyPrice / 100} </p>
                  <p>{formattedData.formattedKeyPrice} </p>
                </>
              ) : (
                <>
                  <p>{formattedData.formattedKeyPrice} </p>
                  <p>${fiatPricing.usd.keyPrice / 100} </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2 flex-col items-center">
              <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
              <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="border-t pt-2 mt-2 w-full flex justify-between">
          {!isLoading ? (
            <div className="space-y-2">
              <ul className="flex items-center gap-2 text-sm">
                <li className="inline-flex items-center gap-2">
                  <span className="text-gray-500"> Duration: </span>
                  <time> {formattedData.formattedDuration} </time>
                </li>
                <li className="inline-flex items-center gap-2">
                  <span className="text-gray-500"> Quantity: </span>
                  <time> {formattedData.formattedKeysAvailable} </time>
                </li>
              </ul>
              <a
                href={config.networks[lock!.network].explorer.urls.address(
                  lock!.address
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm inline-flex items-center gap-2 text-brand-ui-primary hover:opacity-75"
              >
                View Contract <Icon icon={ExternalLinkIcon} size="small" />
              </a>
            </div>
          ) : (
            <div className="py-1.5 space-y-2 items-center">
              <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
              <div className="w-52 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
            </div>
          )}

          <div>
            <input
              onChange={(event) => {
                event.preventDefault()
                const count = event.target.value.replace(/\D/, '')
                setQuantityInput(count)
              }}
              pattern="[0-9]{0,2}"
              value={quantityInput}
              type="text"
              className="rounded border p-2 w-16"
            ></input>
          </div>
        </div>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        >
          {lock!.network !== network && !isUnlockAccount ? (
            <Button
              className="w-full"
              onClick={() => changeNetwork(config.networks[lock!.network])}
            >
              Switch Network
            </Button>
          ) : (
            <div className="flex gap-6 justify-between">
              <Button
                className="w-full"
                disabled={quantity < 1 || isLoading || isUnlockAccount}
                onClick={(event) => {
                  event.preventDefault()
                  if (isUnlockAccount) {
                    changeNetwork(config.networks[lock!.network])
                  }
                  send({
                    type: 'SELECT_QUANTITY',
                    quantity,
                  })
                  send({
                    type: 'SELECT_PAYMENT_METHOD',
                    payment: {
                      method: 'crypto',
                    },
                  })
                  send('CONTINUE')
                }}
              >
                Crypto
              </Button>
              <Button
                className="w-full"
                disabled={
                  quantity < 1 || isLoading || !fiatPricing.creditCardEnabled
                }
                onClick={(event) => {
                  event.preventDefault()
                  if (isUnlockAccount) {
                    changeNetwork(config.networks[lock!.network])
                  }
                  send({
                    type: 'SELECT_QUANTITY',
                    quantity,
                  })
                  send({
                    type: 'SELECT_PAYMENT_METHOD',
                    payment: {
                      method: 'card',
                    },
                  })
                  send('CONTINUE')
                }}
              >
                Credit Card
              </Button>
            </div>
          )}
        </Connected>
      </footer>
    </div>
  )
}
