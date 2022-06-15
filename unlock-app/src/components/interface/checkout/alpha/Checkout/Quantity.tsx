import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { CheckoutState, CheckoutSend } from '../checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Shell } from '../Shell'
import { useQuery } from 'react-query'
import { useState } from 'react'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

export function Quantity({ state, send, injectedProvider }: Props) {
  const lock = state.context.lock!
  const { account, deAuthenticate, network, changeNetwork } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const config = useConfig()
  const [quantityInput, setQuantityInput] = useState('1')
  const quantity = Number(quantityInput)

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
    <>
      <Shell.Content>
        <div>
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
                  event.stopPropagation()
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
        </div>
      </Shell.Content>
      <Shell.Footer>
        {account ? (
          <div className="grid space-y-2">
            {lock!.network !== network ? (
              <Button
                onClick={() => changeNetwork(config.networks[lock!.network])}
              >
                Switch Network
              </Button>
            ) : (
              <div className="text-center grid gap-2">
                <p className="text-sm font-medium">
                  Select payment method to continue
                </p>
                <div className="flex gap-6 justify-between">
                  <Button
                    className="w-full"
                    disabled={quantity < 1 || isLoading}
                    onClick={() => {
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
                    disabled={quantity < 1 || isLoading}
                    onClick={() => {
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
                    Credit
                  </Button>
                </div>
              </div>
            )}
            <LoggedIn account={account} onDisconnect={() => deAuthenticate()} />
          </div>
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
