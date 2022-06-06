import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { CheckoutState, CheckoutStateDispatch } from '../useCheckoutState'
import { PaywallConfig } from '~/unlockTypes'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Shell } from '../Shell'
import { useQuery } from 'react-query'
import { useState } from 'react'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button } from '@unlock-protocol/ui'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  dispatch: CheckoutStateDispatch
  state: CheckoutState
}

export function Quantity({
  state: { lock },
  dispatch,
  injectedProvider,
}: Props) {
  const { account, deAuthenticate, network, changeNetwork } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const config = useConfig()
  const [quantity, setQuantity] = useState(1)

  const { isLoading, data: fiatPricing } = useQuery(
    [quantity, lock!.address, lock!.network],
    async () => {
      const pricing = await getFiatPricing(
        config,
        lock!.address,
        lock!.network,
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
                  href=""
                  className="text-sm text-brand-ui-primary hover:opacity-75"
                >
                  View Contract
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
                  setQuantity(Number(event.target.value))
                }}
                value={quantity}
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
            <LoggedIn account={account} onDisconnect={() => deAuthenticate()} />
            {lock!.network !== network ? (
              <Button
                onClick={() => changeNetwork(config.networks[lock!.network])}
              >
                Switch Network
              </Button>
            ) : (
              <Button
                onClick={() => {
                  dispatch({
                    type: 'ADD_QUANTITY',
                    payload: {
                      count: quantity,
                      keyPrice: Number(lock!.keyPrice),
                      baseToken: '',
                      fiatPricing,
                    },
                  })
                  dispatch({
                    type: 'CONTINUE',
                    payload: {
                      continue: 'METADATA',
                    },
                  })
                }}
              >
                Continue
              </Button>
            )}
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
