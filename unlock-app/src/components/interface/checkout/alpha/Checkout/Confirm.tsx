import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend } from '../checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { LoggedIn, LoggedOut } from '../Bottom'
import { Shell } from '../Shell'
import { useQuery } from 'react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useWalletService } from '~/utils/withWalletService'
import { useState } from 'react'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  state: CheckoutState
}

export function Confirm({ state, send, injectedProvider }: Props) {
  const { account, deAuthenticate } = useAuth()
  const walletService = useWalletService()
  const config = useConfig()
  const [isConfirming, setIsConfirming] = useState(false)
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const { lock, quantity, recipients } = state.context
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

  const onConfirm = async () => {
    try {
      setIsConfirming(true)
      const keyPrices: string[] = new Array(recipients!.length).fill(
        lock!.keyPrice
      )
      await walletService.purchaseKeys(
        {
          lockAddress: lock!.address,
          keyPrices,
          owners: recipients!,
        },
        (error, hash) => {
          if (error) {
            send({
              type: 'CONFIRM_MINT',
              status: 'ERROR',
              transactionHash: hash!,
            })
            throw new Error(error.message)
          } else {
            send({
              type: 'CONFIRM_MINT',
              status: 'PROCESSING',
              transactionHash: hash!,
            })
          }
          setIsConfirming(false)
        }
      )
      send({
        type: 'FINISH_MINT',
        status: 'FINISHED',
        transactionHash: state.context.mint?.transactionHash,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
    }
  }

  return (
    <>
      <Shell.Content>
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl">
              {quantity}X {lock!.name}
            </h3>
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
                <p className="text-sm text-gray-500">
                  {quantity} X {formattedData.formattedKeyPrice}
                </p>
              </div>
            ) : (
              <div className="flex gap-2 flex-col items-center">
                <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
                <div className="w-16 bg-gray-100 p-2 rounded-lg animate-pulse"></div>
              </div>
            )}
          </div>
          {!isLoading ? (
            <div className="space-y-1 border-t-2 py-2 border-brand-gray mt-2">
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
        </div>
      </Shell.Content>
      <Shell.Footer>
        <div className="space-y-4">
          <Button
            disabled={isLoading || isConfirming || !account}
            loading={isConfirming}
            onClick={onConfirm}
            className="w-full"
          >
            {isConfirming ? 'Confirm the transaction' : 'Confirm'}
          </Button>
          {account ? (
            <LoggedIn account={account} onDisconnect={() => deAuthenticate()} />
          ) : (
            <LoggedOut
              authenticateWithProvider={authenticateWithProvider}
              onUnlockAccount={() => {}}
            />
          )}
        </div>
      </Shell.Footer>
    </>
  )
}
