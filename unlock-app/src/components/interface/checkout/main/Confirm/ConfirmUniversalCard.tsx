import { CheckoutService } from './../checkoutMachine'
import { Connected } from '../../Connected'
import { useConfig } from '~/utils/withConfig'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { loadStripeOnramp } from '@stripe/crypto'
import { useActor } from '@xstate/react'
import { storage } from '~/config/storage'
import { useMutation } from '@tanstack/react-query'

import { PoweredByUnlock } from '../../PoweredByUnlock'
import { ViewContract } from '../../ViewContract'
import { PricingData } from './PricingData'
import { CryptoElements, OnrampElement } from '../../utils/CryptoElements'
import { CreditCardPricingBreakdown } from './ConfirmCard'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useUniversalCardPrice } from '~/hooks/useUniversalCardPrice'
import { usePurchaseData } from '~/hooks/usePurchaseData'
import { useGetLockSettings } from '~/hooks/useLockSettings'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onConfirmed: (lock: string, hash?: string) => void
  onError: (message: string) => void
}

export function ConfirmUniversalCard({
  injectedProvider,
  checkoutService,
  onConfirmed,
  onError,
}: Props) {
  const { getWalletService, account } = useAuth()
  const [state] = useActor(checkoutService)
  const config = useConfig()
  const [sessionError, setSessionError] = useState<string>('')
  const [onrampSession, setOnrampSession] = useState<any>(null)
  const stripeOnrampPromise = loadStripeOnramp(config.stripeApiKey)

  const { lock, recipients, paywallConfig, data } = state.context

  // Build the `purchaseData` field that gets passed to the contract
  const { isInitialLoading: isInitialDataLoading, data: purchaseData } =
    usePurchaseData({
      lockAddress: lock!.address,
      network: lock!.network,
      paywallConfig,
      recipients,
      data,
    })

  // And now get the price to pay by card
  const {
    data: cardPricing,
    isInitialLoading: isCardPricingLoading,
    isFetched: isCardPricingFetched,
  } = useUniversalCardPrice({
    network: lock!.network,
    lockAddress: lock!.address,
    recipients,
    purchaseData: purchaseData!,
    enabled: !isInitialDataLoading,
  })

  const { data: { unlockFeeChargedToUser } = {} } = useGetLockSettings({
    network: lock!.network,
    lockAddress: lock!.address,
  })

  const createOnRampSession = useMutation(
    async ({ network, lockAddress, body }: any) => {
      const response = await storage.createOnRampSession(
        network,
        lockAddress,
        body
      )
      return response.data
    },
    {}
  )

  const captureOnRampSession = useMutation(async (session: any) => {
    const response = await storage.captureOnRampSession(
      session.id,
      session.quote.blockchain_tx_id
    )
    return response.data.hash
  })

  // TODO: Also configure webhook on the Stripe side?
  const onChange = async (event: any) => {
    const { session } = event

    if (
      session?.wallet_address &&
      account &&
      session?.wallet_address.toLowerCase() !== account.toLowerCase()
    ) {
      setSessionError(
        'You cannot change the recipient address as it is the address that will receive the NFT membership token. Please start again.'
      )
    }

    const expectedAmount = cardPricing?.total
    // We use Math.round because
    // > 100 * parseFloat('1.13')
    // 112.99999999999999
    const destinationAmount =
      session.quote.destination_amount &&
      Math.round(100 * parseFloat(session.quote.destination_amount))

    if (destinationAmount !== expectedAmount) {
      console.error('Price changed', destinationAmount, expectedAmount)
      setSessionError('You cannot change the amount. Please start again.')
    }

    if (session.status === 'fulfillment_complete') {
      const transactionHash = await captureOnRampSession.mutateAsync(session)
      if (transactionHash) {
        onConfirmed(lock!.address, transactionHash)
      }
    }
  }

  // User triggers the payment!
  const signPermit = async () => {
    try {
      const walletService = await getWalletService(lock!.network)
      const {
        transferSignature,
        transferMessage,
        purchaseSignature,
        purchaseMessage,
      } = await walletService.getAndSignAuthorizationsForTransferAndPurchase({
        lockAddress: lock!.address,
        network: lock!.network,
        amount: cardPricing!.total.toString(), // amount is a string in cents
      })

      // We pass recipients and purchaseData as these will be used for the onchain transaction
      const session = await createOnRampSession.mutateAsync({
        network: lock!.network,
        lockAddress: lock!.address,
        body: {
          transferSignature,
          transferMessage,
          purchaseSignature,
          purchaseMessage,
          recipients,
          purchaseData: purchaseData!,
        },
      })
      setOnrampSession(session)
    } catch (error) {
      console.error(error)
      onError(`We could not initiate the card payment. Please try again!`)
    }
  }

  if (isCardPricingLoading || !cardPricing) {
    return (
      <>
        {recipients.map((user) => (
          <div
            key={user}
            className="w-full p-4 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </>
    )
  }

  return (
    <Fragment>
      {/* Show confirmation first */}
      {!onrampSession?.client_secret && (
        <>
          <main className="h-full px-6 py-2 overflow-auto">
            <div className="grid gap-y-2">
              <div>
                <h4 className="text-xl font-bold"> {lock!.name}</h4>
                <ViewContract
                  lockAddress={lock!.address}
                  network={lock!.network}
                />
              </div>
              <PricingData
                network={lock!.network}
                lock={lock!}
                pricingData={cardPricing}
              />
              <CreditCardPricingBreakdown
                loading={isCardPricingLoading || !isCardPricingFetched}
                total={cardPricing?.total}
                creditCardProcessingFee={cardPricing?.creditCardProcessingFee}
                unlockServiceFee={cardPricing?.unlockServiceFee}
                gasCosts={cardPricing?.gasCost}
                unlockFeeChargedToUser={unlockFeeChargedToUser}
              />
            </div>
          </main>
          <footer className="grid items-center px-6 pt-6 border-t">
            <Connected
              injectedProvider={injectedProvider}
              service={checkoutService}
            >
              <Button
                disabled={isCardPricingLoading}
                type="submit"
                form="payment"
                className="w-full"
                onClick={signPermit}
              >
                Checkout with Stripe
              </Button>
            </Connected>
            <PoweredByUnlock />
          </footer>
        </>
      )}

      {/* Show error */}
      {sessionError && (
        <>
          <main className="h-full px-6 py-2 overflow-auto">
            <p>{sessionError}</p>
          </main>
          <footer className="grid items-center px-6 pt-6 border-t">
            <Connected
              injectedProvider={injectedProvider}
              service={checkoutService}
            >
              <Button
                disabled={isCardPricingLoading}
                type="submit"
                form="payment"
                className="w-full"
                onClick={() => {
                  setSessionError('')
                  setOnrampSession(null)
                }}
              >
                Restart
              </Button>
            </Connected>
            <PoweredByUnlock />
          </footer>
        </>
      )}

      {/* Show Stripe form */}
      {!sessionError && onrampSession?.client_secret && (
        <main className="">
          <CryptoElements stripeOnramp={stripeOnrampPromise}>
            <OnrampElement
              clientSecret={onrampSession.client_secret}
              onChange={onChange}
              appearance={{
                theme: 'stripe',
              }}
            />
          </CryptoElements>
        </main>
      )}
    </Fragment>
  )
}
