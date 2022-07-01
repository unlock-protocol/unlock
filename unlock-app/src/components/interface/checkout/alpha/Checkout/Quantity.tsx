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
import { Shell } from '../Shell'
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

  const disable = quantity < 1 || isLoading
  const disableCreditCard = !fiatPricing?.creditCardEnabled
  const disableCrypto = isUnlockAccount

  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head
        title={paywallConfig.title}
        iconURL={iconURL}
        description={description}
      />
      <div className="flex px-6 py-6 flex-wrap items-center w-full gap-2">
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
          {paywallConfig.messageToSign && <ProgressCircleIcon disabled />}
          <ProgressCircleIcon disabled />
          <ProgressFinishIcon disabled />
        </div>
      </div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl"> {lock?.name}</h3>
          {!isLoading ? (
            <div className="text-right grid">
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
                if (
                  paywallConfig.maxRecipients &&
                  countInt > paywallConfig.maxRecipients
                ) {
                  ToastHelper.error(
                    `You cannot purchase more than ${paywallConfig.maxRecipients} memberships at once`
                  )
                  setQuantityInput(paywallConfig.maxRecipients.toString())
                  return
                }
                if (
                  paywallConfig.minRecipients &&
                  countInt < paywallConfig.minRecipients
                ) {
                  ToastHelper.error(
                    `You cannot purchase less than ${paywallConfig.minRecipients} memberships at once`
                  )
                  setQuantityInput(paywallConfig.minRecipients.toString())
                  return
                }
                setQuantityInput(count)
              }}
              pattern="[0-9]{0,2}"
              value={quantityInput}
              type="text"
              className="w-16 rounded-lg border-2 border-gray-300 focus:ring-0 focus:border-brand-ui-primary"
            ></input>
          </div>
        </div>

        <div className="mt-2">
          {disableCreditCard && disableCrypto ? (
            <p className="text-sm text-gray-500">
              Both payment options are disabled because the lock doesn&apos;t
              support credit card payments and you are logged in with an unlock
              account. Change to crypto wallet or go back and select a different
              lock if there are multiple.
            </p>
          ) : disableCreditCard ? (
            <p className="text-sm text-gray-500">
              Credit card payment is disabled on this lock.
            </p>
          ) : disableCrypto ? (
            <p className="text-sm text-gray-500">
              You cannot buy using crypto because you are logged in using an
              unlock account.
            </p>
          ) : null}
        </div>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
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
            <div className="flex gap-4 justify-between">
              <Button
                className="w-full"
                disabled={disable || disableCrypto}
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
                disabled={disable || disableCreditCard}
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
        <PoweredByUnlock />
      </footer>
    </Shell.Root>
  )
}
