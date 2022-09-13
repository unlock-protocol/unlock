import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { useQuery } from 'react-query'
import { Fragment, useState } from 'react'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button, Icon } from '@unlock-protocol/ui'
import {
  RiExternalLinkLine as ExternalLinkIcon,
  RiTimer2Line as DurationIcon,
  RiCoupon2Line as QuantityIcon,
} from 'react-icons/ri'
import { useActor } from '@xstate/react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { LabeledItem } from '../LabeledItem'
import { useCheckoutSteps } from './useCheckoutItems'
import { Pricing } from '../Lock'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

const QuantityPlaceholder = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
      <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  )
}

export function Quantity({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()

  const { paywallConfig, quantity: selectedQuantity } = state.context
  const lock = state.context.lock!

  const lockConfig = paywallConfig.locks[lock.address]

  const maxRecipients =
    lockConfig.maxRecipients || paywallConfig.maxRecipients || 1

  const minRecipients =
    lockConfig.minRecipients || paywallConfig.minRecipients || 1

  const [quantityInput, setQuantityInput] = useState(
    selectedQuantity?.toString() || minRecipients.toString()
  )

  const quantity = Number(quantityInput)

  const { isLoading, data: fiatPricing } = useQuery(
    ['fiat', quantity, lock.address, lock.network],
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
  const isDisabled = quantity < 1 || isLoading
  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper position={2} service={checkoutService} items={stepItems} />
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold"> {lock?.name}</h3>
            {!isLoading ? (
              <div className="grid text-right">
                <Pricing
                  keyPrice={formattedData.formattedKeyPrice}
                  usdPrice={formattedData.convertedKeyPrice}
                  isCardEnabled={formattedData.cardEnabled}
                />
              </div>
            ) : (
              <QuantityPlaceholder />
            )}
          </div>
          <div className="flex justify-between w-full">
            {!isLoading ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-4">
                  <LabeledItem
                    label="Duration"
                    icon={DurationIcon}
                    value={formattedData.formattedDuration}
                  />
                  <LabeledItem
                    label="Quantity"
                    icon={QuantityIcon}
                    value={
                      formattedData.isSoldOut
                        ? 'Sold out'
                        : formattedData.formattedKeysAvailable
                    }
                  />
                </div>
                <a
                  href={config.networks[lock!.network].explorer.urls.address(
                    lock!.address
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
                >
                  View Contract <Icon icon={ExternalLinkIcon} size="small" />
                </a>
              </div>
            ) : (
              <div className="py-1.5 space-y-2 items-center">
                <div className="p-2 bg-gray-100 rounded-lg w-52 animate-pulse"></div>
                <div className="p-2 bg-gray-100 rounded-lg w-52 animate-pulse"></div>
              </div>
            )}
            <div>
              <input
                aria-label="Quantity"
                onChange={(event) => {
                  event.preventDefault()
                  const count = event.target.value.replace(/\D/, '')
                  const countInt = parseInt(count, 10)
                  const maxAllowed = countInt > maxRecipients
                  const minAllowed = countInt < minRecipients

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
                className="w-16 text-sm border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-brand-ui-primary"
              ></input>
            </div>
          </div>
        </div>
      </main>
      <footer className="items-center px-6 pt-6 border-t">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        >
          <div className="grid">
            <Button
              disabled={isDisabled}
              onClick={async (event) => {
                event.preventDefault()
                send({
                  type: 'SELECT_QUANTITY',
                  quantity,
                })
              }}
            >
              {quantity > 1 ? `Buy ${quantity} memberships` : 'Next'}
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
