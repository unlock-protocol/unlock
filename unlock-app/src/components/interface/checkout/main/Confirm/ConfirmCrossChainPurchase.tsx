import { CheckoutService } from './../checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../../PoweredByUnlock'
import { Pricing } from '../../Lock'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { Lock } from '~/unlockTypes'
import { RiErrorWarningFill as ErrorIcon } from 'react-icons/ri'
import { useUpdateUsersMetadata } from '~/hooks/useUserMetadata'
import { usePricing } from '~/hooks/usePricing'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { formatNumber } from '~/utils/formatter'
import { PricingData } from './PricingData'
import Disconnect from '../Disconnect'
import { ethers } from 'ethers'
import { approveTransfer, getAllowance } from '@unlock-protocol/unlock-js'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

interface Props {
  checkoutService: CheckoutService
  onConfirmed: (lock: string, network: number, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmCrossChainPurchase({
  checkoutService,
  onConfirmed,
}: Props) {
  const [buttonLabel, setButtonLabel] = useState('Pay using crypto')
  const { lock, recipients, payment, paywallConfig, metadata, data } =
    useSelector(checkoutService, (state) => state.context)
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const config = useConfig()

  const [isConfirming, setIsConfirming] = useState(false)

  const { address: lockAddress, network: lockNetwork } = lock!

  // @ts-expect-error Property 'route' does not exist on type '{ method: "card"; cardId?: string | undefined; }'.
  const route = payment.route

  const { mutateAsync: updateUsersMetadata } = useUpdateUsersMetadata()

  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      paywallConfig,
      recipients,
      data,
    })

  const {
    data: pricingData,
    isInitialLoading: isPricingDataLoading,
    isError: isPricingDataError,
  } = usePricing({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients,
    currencyContractAddress: lock?.currencyContractAddress,
    data: purchaseData!,
    paywallConfig,
    enabled: !isInitialDataLoading,
    symbol: lockTickerSymbol(
      lock as Lock,
      config.networks[lock!.network].nativeCurrency.symbol
    ),
    payment,
  })

  const isPricingDataAvailable =
    !isPricingDataLoading && !isPricingDataError && !!pricingData

  const symbol = route.tokenPayment.isNative
    ? route.currency
    : route.tokenPayment.symbol

  const isLoading = isPricingDataLoading || isInitialDataLoading

  const onError = (error: any, message?: string) => {
    console.error(error)
    switch (error.code) {
      case -32000:
      case 4001:
      case 'ACTION_REJECTED':
        ToastHelper.error('Transaction rejected.')
        break
      case 'INSUFFICIENT_FUNDS':
        ToastHelper.error('Insufficient funds.')
        break
      default:
        ToastHelper.error(message || error?.error?.message || error.message)
    }
  }

  const onConfirm = async () => {
    if (!pricingData) {
      return
    }

    try {
      setIsConfirming(true)
      const walletService = await getWalletService(route.network)

      if (!route.tokenPayment.isNative) {
        const requiredAllowance = BigInt(route.tokenPayment.amount)
        const allowance = await getAllowance(
          route.tokenPayment.tokenAddress,
          route.tx.to,
          walletService.provider,
          account!
        )
        if (requiredAllowance > allowance) {
          setButtonLabel(`Approving ${symbol}...`)
          // Handle ERC20 approvals only for non-native tokens
          const approveTx = await approveTransfer(
            route.tokenPayment.tokenAddress,
            route.tx.to,
            requiredAllowance,
            walletService.provider,
            walletService.signer
          )
          await approveTx.wait()
        }
      }
      setButtonLabel('Purchasing...')

      // delete unwanted gas values
      delete route.tx.gasLimit
      delete route.tx.maxFeePerGas
      delete route.tx.maxPriorityFeePerGas

      const tx = await walletService.signer.sendTransaction(route.tx)
      onConfirmed(lockAddress, route.network, tx.hash)
    } catch (error: any) {
      setIsConfirming(false)
      onError(error)
    }
  }

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
            isCardEnabled={false}
            keyPrice={`${formatNumber(
              Number(
                ethers.formatUnits(
                  route.tokenPayment.amount,
                  route.tokenPayment.decimals
                )
              )
            )} ${symbol}`}
          />
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <div className="grid">
          <Button
            loading={isConfirming}
            disabled={isConfirming || isLoading || isPricingDataError}
            onClick={async (event) => {
              event?.preventDefault()
              if (metadata) {
                await updateUsersMetadata(metadata)
              }
              onConfirm()
            }}
          >
            {buttonLabel}
          </Button>
        </div>
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
