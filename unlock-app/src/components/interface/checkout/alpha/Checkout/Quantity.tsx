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
import { Stepper } from '../Progress'
import { LabeledItem } from '../LabeledItem'

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
  const {
    paywallConfig,
    quantity: selectedQuantity,
    skipQuantity,
  } = state.context
  const lock = state.context.lock!
  const [quantityInput, setQuantityInput] = useState(
    selectedQuantity?.toString() ||
      paywallConfig.minRecipients?.toString() ||
      '1'
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

  return (
    <Fragment>
      <Stepper
        position={2}
        service={checkoutService}
        items={[
          {
            id: 1,
            name: 'Select lock',
            to: 'SELECT',
          },
          {
            id: 2,
            name: 'Choose quantity',
            skip: skipQuantity,
            to: 'QUANTITY',
          },
          {
            id: 3,
            name: 'Add recipients',
            to: 'METADATA',
          },
          {
            id: 4,
            name: 'Choose payment',
            to: 'PAYMENT',
          },
          {
            id: 5,
            name: 'Sign message',
            skip: !paywallConfig.messageToSign,
            to: 'MESSAGE_TO_SIGN',
          },
          {
            id: 6,
            name: 'Solve captcha',
            to: 'CAPTCHA',
            skip: !paywallConfig.captcha,
          },
          {
            id: 7,
            name: 'Confirm',
            to: 'CONFIRM',
          },
          {
            id: 8,
            name: 'Minting NFT',
          },
        ]}
      />
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold"> {lock?.name}</h3>
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
            <QuantityPlaceholder />
          )}
        </div>
        <div className="w-full border-t"></div>
        <div className="flex justify-between w-full pt-2 mt-2">
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
              className="w-16 text-sm border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-brand-ui-primary"
            ></input>
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
