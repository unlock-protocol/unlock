import Link from 'next/link'
import { Button, Card, Modal, Placeholder } from '@unlock-protocol/ui'
import { useState } from 'react'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useGetEventLocksConfig } from '~/hooks/useGetEventLocksConfig'
import { useValidKeyBulk } from '~/hooks/useKey'
import { useConfig } from '~/utils/withConfig'
import { Checkout } from '~/components/interface/checkout/main'
import { LockPriceDetails } from './LockPriceDetails'

interface CheckoutRegistrationCardProps {
  isManager: boolean
  lockAddress: string
  network: number
  onPurchase: () => void
}

export const CheckoutRegistrationCard = ({
  isManager,
  lockAddress,
  network,
  onPurchase,
}: CheckoutRegistrationCardProps) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)

  const config = useConfig()

  const {
    locks: eventLocks,
    isLoading: isLoadingEventLocks,
    checkoutConfig,
  } = useGetEventLocksConfig({
    lockAddress,
    network,
  })

  const queries = useValidKeyBulk(eventLocks)
  const isLoadingValidKeys = queries?.some(
    (query) => query.isInitialLoading || query.isRefetching
  )
  const hasValidKey = queries?.map((query) => query.data).some((value) => value)

  const injectedProvider = selectProvider(config)

  const showCardPlaceholder = isLoadingEventLocks || isLoadingValidKeys

  if (showCardPlaceholder) {
    return <Placeholder.Card size="md" />
  }

  // not match found for the assigned Checkout ID, for example could be deleted
  if (eventLocks.length === 0) {
    return (
      <Card className="grid gap-6 mt-10 lg:mt-0">
        <span className="text-2xl font-bold text-gray-900">Registration</span>
        <span>
          {isManager
            ? 'The checkout URL assigned to this event is deleted or invalid. Please make sure to assign an existing one.'
            : 'Registration details are not configured.'}
        </span>
      </Card>
    )
  }

  return (
    <>
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={checkoutConfig as any}
          handleClose={() => {
            setCheckoutOpen(false)
            onPurchase()
          }}
        />
      </Modal>
      <Card className="grid gap-6 mt-10 lg:mt-0">
        <span className="text-2xl font-bold text-gray-900">Registration</span>
        {hasValidKey ? (
          <p className="text-lg">
            🎉 You already have a ticket! You can view it in{' '}
            <Link className="underline" href="/keychain">
              your keychain
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {eventLocks?.map(({ lockAddress, network }) => {
              return (
                <LockPriceDetails
                  key={lockAddress}
                  lockAddress={lockAddress}
                  network={network}
                  showContract
                />
              )
            })}
          </div>
        )}
        <Button
          variant="primary"
          size="medium"
          onClick={() => {
            setCheckoutOpen(true)
          }}
        >
          Register
        </Button>
      </Card>
    </>
  )
}
