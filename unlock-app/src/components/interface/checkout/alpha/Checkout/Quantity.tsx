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
import { CheckoutHead, CloseButton } from '../Shell'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { useCheckoutHeadContent } from '../useCheckoutHeadContent'
import { IconButton, ProgressCircleIcon, ProgressFinishIcon } from '../Progress'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
}

export function Quantity({
  injectedProvider,
  checkoutService,
  onClose,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const { network, isUnlockAccount, changeNetwork } = useAuth()
  const config = useConfig()
  const { paywallConfig } = state.context
  const lock = state.context.lock!
  const [quantityInput, setQuantityInput] = useState(
    paywallConfig.minRecipients?.toString() || '1'
  )
  const { title, description, iconURL } =
    useCheckoutHeadContent(checkoutService)
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

  const fiatPrice = fiatPricing?.usd?.keyPrice
  const isNetworkSwitchRequired = lock?.network !== network && !isUnlockAccount
  const lockNetwork = config.networks?.[lock?.network]
  const isDisabled = quantity < 1 || isLoading

  return (
    <div className="bg-white max-w-md rounded-xl flex flex-col w-full h-[80vh]">
      <div className="flex items-center justify-end mt-4 mx-4">
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
            <IconButton
              title="Select lock"
              icon={ProgressCircleIcon}
              onClick={() => {
                send('SELECT')
              }}
            />
            <ProgressCircleIcon />
          </div>
          <h4 className="text-sm "> {title}</h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
        <div className="inline-flex items-center gap-0.5">
          <ProgressCircleIcon disabled />
          <ProgressCircleIcon disabled />
          {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishIcon disabled />
        </div>
      </div>
      <main className="p-6 overflow-auto h-full">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl"> {lock?.name}</h3>
          {!isLoading ? (
            <div className="text-right grid min-h-[3rem]">
              {fiatPricing.creditCardEnabled ? (
                <>
                  {!!fiatPrice && (
                    <span className="font-semibold">
                      ${(fiatPrice / 100).toFixed(2)}
                    </span>
                  )}
                  <span>{formattedData.formattedKeyPrice} </span>
                </>
              ) : (
                <>
                  <span className="font-semibold">
                    {formattedData.formattedKeyPrice}
                  </span>
                  {!!fiatPrice && <span>${(fiatPrice / 100).toFixed(2)}</span>}
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
              <ul className="flex items-center gap-2 text-sm flex-wrap">
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
                const countInt = parseInt(count, 10)
                const { maxRecipients, minRecipients } = paywallConfig
                const maxAllowed = maxRecipients && countInt > maxRecipients
                const minAllowed = minRecipients && countInt < minRecipients

                if (maxAllowed) {
                  ToastHelper.error(
                    `You cannot purchase more than ${paywallConfig.maxRecipients} memberships at once`
                  )
                  return setQuantityInput(maxRecipients!.toString())
                }
                if (minAllowed) {
                  ToastHelper.error(
                    `You cannot purchase less than ${paywallConfig.minRecipients} memberships at once`
                  )
                  return setQuantityInput(minRecipients!.toString())
                }
                setQuantityInput(count)
              }}
              pattern="[0-9]{0,2}"
              value={quantityInput}
              type="text"
              className="w-16 text-sm rounded-lg border-2 border-gray-300 focus:ring-0 focus:border-brand-ui-primary"
            ></input>
          </div>
        </div>
      </main>
      <footer className="px-6 pt-6 border-t items-center">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        >
          <div className="grid">
            {isNetworkSwitchRequired ? (
              <Button
                onClick={(event) => {
                  event.preventDefault()
                  changeNetwork(lockNetwork)
                }}
              >
                Switch to {lockNetwork.name} network
              </Button>
            ) : (
              <Button
                disabled={isDisabled}
                onClick={(event) => {
                  event.preventDefault()
                  send({
                    type: 'SELECT_QUANTITY',
                    quantity,
                  })
                }}
              >
                Add {quantity} {quantity > 1 ? 'memberships' : 'membership'}
              </Button>
            )}
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </div>
  )
}
