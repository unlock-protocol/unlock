import { CheckoutService } from './../checkoutMachine'
import { useQuery } from '@tanstack/react-query'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useEffect, useState } from 'react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { useSelector } from '@xstate/react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Pricing } from '../../Lock'
import { getReferrer, lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { formatNumber } from '~/utils/formatter'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'
import { PricingData } from './PricingData'
import Disconnect from '../Disconnect'
import { getNumberOfRecurringPayments } from '../utils'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmCrypto({
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const {
    lock,
    recipients,
    payment,
    paywallConfig,
    keyManagers,
    metadata,
    data,
    renew,
  } = useSelector(checkoutService, (state) => state.context)
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const config = useConfig()
  const web3Service = useWeb3Service()
  const [isConfirming, setIsConfirming] = useState(false)

  const { address: lockAddress, network: lockNetwork, keyPrice } = lock!

  const currencyContractAddress = lock?.currencyContractAddress

  const numberOfRecurringPayments = getNumberOfRecurringPayments(
    paywallConfig?.locks[lockAddress]?.recurringPayments ||
      paywallConfig?.recurringPayments
  )

  const recurringPayments: number[] = new Array(recipients.length).fill(
    numberOfRecurringPayments
  )

  const { data: creditCardEnabled } = useCreditCardEnabled({
    lockAddress,
    network: lockNetwork,
  })

  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

  const {
    isLoading: isInitialDataLoading,
    data: purchaseData,
    error,
  } = usePurchaseData({
    lockAddress: lock!.address,
    network: lock!.network,
    paywallConfig,
    recipients,
    data,
  })

  const {
    data: pricingData,
    isLoading: isPricingDataLoading,
    isError: isPricingDataError,
  } = usePricing({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients,
    currencyContractAddress,
    data: purchaseData!,
    paywallConfig,
    enabled: !isInitialDataLoading,
    symbol: lockTickerSymbol(
      lock as Lock,
      config.networks[lock!.network].nativeCurrency.symbol
    ),
  })

  const isPricingDataAvailable =
    !isPricingDataLoading && !isPricingDataError && !!pricingData

  // TODO: run full estimate so we can catch all errors, rather just check balances
  const { data: isPayable, isLoading: isPayableLoading } = useQuery({
    queryKey: ['canAfford', account, lock, pricingData],
    queryFn: async () => {
      const [balance, networkBalance] = await Promise.all([
        getAccountTokenBalance(
          web3Service,
          account!,
          currencyContractAddress,
          lock!.network
        ),
        getAccountTokenBalance(web3Service, account!, null, lock!.network),
      ])

      // @ts-expect-error Type error: 'pricingData' is possibly 'undefined'. (not really because this hook is only enabled if isPricingDataAvailable)
      const totalAmount = pricingData.total

      const isTokenPayable = totalAmount <= Number(balance)
      const isGasPayable = Number(networkBalance) > 0 // TODO: improve actual calculation (from estimate!). In the meantime, the wallet should warn them!
      return {
        isTokenPayable,
        isGasPayable,
      }
    },
    enabled: isPricingDataAvailable,
  })

  // By default, until fully loaded we assume payable.
  const canAfford =
    !isPayable || (isPayable?.isTokenPayable && isPayable?.isGasPayable)

  const isLoading =
    isPricingDataLoading || isInitialDataLoading || isPayableLoading

  const baseCurrencySymbol = config.networks[lockNetwork].nativeCurrency.symbol
  const symbol = lockTickerSymbol(lock as Lock, baseCurrencySymbol)

  const onConfirmCrypto = async () => {
    try {
      setIsConfirming(true)
      const keyPrices: string[] =
        pricingData?.prices.map((item) => item.amount.toString()) ||
        new Array(recipients!.length).fill(keyPrice)

      const referrers: string[] = recipients.map((recipient) => {
        return getReferrer(recipient, paywallConfig, lockAddress)
      })

      const onErrorCallback = (error: Error | null, hash: string | null) => {
        setIsConfirming(false)
        if (error) {
          checkoutService.send({
            type: 'CONFIRM_MINT',
            status: 'ERROR',
            transactionHash: hash!,
          })
        } else if (hash) {
          onConfirmed(lockAddress, lockNetwork, hash)
        }
      }

      const walletService = await getWalletService(lockNetwork)
      if (renew) {
        await walletService.extendKey(
          {
            lockAddress,
            owner: recipients?.[0],
            referrer: getReferrer(account!, paywallConfig, lockAddress),
            data: purchaseData?.[0],
            recurringPayment: recurringPayments
              ? recurringPayments[0]
              : undefined,
          },
          {} /** Transaction params */,
          onErrorCallback
        )
      } else {
        await walletService.purchaseKeys(
          {
            lockAddress,
            keyPrices,
            owners: recipients!,
            data: purchaseData,
            keyManagers: keyManagers?.length ? keyManagers : undefined,
            recurringPayments,
            referrers,
          },
          {} /** Transaction params */,
          onErrorCallback
        )
      }
    } catch (error: any) {
      setIsConfirming(false)
      console.error(error)
      switch (error.code) {
        case -32000:
        case 4001:
        case 'ACTION_REJECTED':
          onError('Transaction rejected.')
          break
        case 'INSUFFICIENT_FUNDS':
          onError('Insufficient funds.')
          break
        case 'CALL_EXCEPTION':
          onError('Transaction failed.')
          break
        default:
          onError(error?.error?.message || error.message)
      }
    }
  }

  let buttonLabel = ''
  const isFree = pricingData?.prices.reduce((previousTotal, item) => {
    return previousTotal && item.amount === 0
  }, true)

  if (isFree) {
    if (isConfirming) {
      buttonLabel = 'Claiming'
    } else {
      buttonLabel = 'Claim'
    }
  } else {
    if (isConfirming) {
      buttonLabel = 'Paying using crypto'
    } else {
      buttonLabel = 'Pay using crypto'
    }
  }

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])

  return (
    <Fragment>
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="grid gap-y-2">
          <h4 className="text-xl font-bold"> {lock!.name}</h4>
          {isPricingDataError && (
            // TODO: use actual error from simulation
            <div>
              <p className="text-sm font-bold">
                <ErrorIcon className="inline" />
                There was an error when preparing the transaction.
              </p>
            </div>
          )}
          {!isLoading && isPricingDataAvailable && (
            <PricingData
              network={lockNetwork}
              lock={lock!}
              prices={pricingData.prices}
              payment={payment}
            />
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            {recipients.map((user) => (
              <div
                key={user}
                className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {pricingData && (
          <Pricing
            keyPrice={
              pricingData.total <= 0
                ? 'FREE'
                : `${formatNumber(
                    pricingData.total
                  ).toLocaleString()} ${symbol}`
            }
            isCardEnabled={!!creditCardEnabled}
          />
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <div className="grid">
          <Button
            loading={isConfirming}
            disabled={
              isConfirming || isLoading || !canAfford || isPricingDataError
            }
            onClick={async (event) => {
              event.preventDefault()
              if (metadata) {
                await updateUsersMetadata(metadata)
              }
              onConfirmCrypto()
            }}
          >
            {buttonLabel}
          </Button>
          {!isLoading && !isPricingDataError && isPayable && (
            <>
              {!isPayable?.isTokenPayable && (
                <small className="text-center text-red-500">
                  You do not have enough {symbol} to complete this purchase.
                </small>
              )}
              {isPayable?.isTokenPayable && !isPayable?.isGasPayable && (
                <small className="text-center text-red-500">
                  You do not have enough{' '}
                  {config.networks[lock!.network].nativeCurrency.symbol} to pay
                  transaction fees (gas).
                </small>
              )}
            </>
          )}
        </div>
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
