import fontColorContrast from 'font-color-contrast'
import { PaywallConfig } from '~/unlockTypes'
import { useCanClaim } from '~/hooks/useCanClaim'
import { WalletlessRegistrationForm } from './WalletlessRegistration'
import { useValidKey, useValidKeyBulk } from '~/hooks/useKey'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { LockPriceDetails } from './LockPriceDetails'
import { useLockData } from '~/hooks/useLockData'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { Button, Card, Placeholder, Modal } from '@unlock-protocol/ui'
import Link from 'next/link'
import { Checkout } from '~/components/interface/checkout/main'
import { useState } from 'react'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useConfig } from '~/utils/withConfig'
import { CheckoutRegistrationCard } from './CheckoutRegistrationCard'
import { useCheckoutConfig } from '~/hooks/useCheckoutConfig'

interface RegistrationCardProps {
  event: any
}

const CustomCheckoutRegistrationCard = ({
  checkoutConfigId,
}: {
  checkoutConfigId: string
}) => {
  const config = useConfig()
  const injectedProvider = selectProvider(config)
  const { isLoading, data } = useCheckoutConfig({
    id: checkoutConfigId,
  })

  if (isLoading) {
    return <Placeholder.Card size="md" />
  }

  const checkoutConfig = data?.config

  return (
    <Checkout
      injectedProvider={injectedProvider as any}
      paywallConfig={checkoutConfig as any}
      handleClose={() => {
        setCheckoutOpen(false)
        onPurchase()
      }}
    />
  )
}

export const RegistrationCardInternal = ({ event }: RegistrationCardProps) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { account } = useAuth()
  const config = useConfig()
  const injectedProvider = selectProvider(config)

  const queries = useValidKeyBulk(
    Object.keys(event.locks).reduce((acc, lockAddress: string) => {
      return [
        ...acc,
        { lockAddress, network: event.locks[lockAddress].network },
      ]
    }, [])
  )
  const isLoadingValidKeys = queries?.some(
    (query) => query.isInitialLoading || query.isRefetching
  )
  const hasValidKey = queries?.map((query) => query.data).some((value) => value)

  const { isLoading: isClaimableLoading, data: isClaimable } = useCanClaim(
    {
      recipients: [account || ZERO],
      lockAddress: Object.keys(event.locks)[0],
      network: event.locks[Object.keys(event.locks)[0]].network,
      data: [],
    },
    { enabled: Object.keys(event.locks).length === 1 }
  )

  if (isLoadingValidKeys || isClaimableLoading) {
    return <Placeholder.Card size="md" />
  }

  if (hasValidKey) {
    return (
      <p className="text-lg">
        🎉 You already have a ticket! You can view it in{' '}
        <Link className="underline" href="/keychain">
          your keychain
        </Link>
        .
      </p>
    )
  }

  if (event.checkoutConfigId) {
    return (
      <CustomCheckoutRegistrationCard
        checkoutConfigId={event.checkoutConfigId}
        onPurchase={() => {
          console.log('purchase done!')
        }}
      />
    )
  }

  if (isClaimable) {
    return (
      <WalletlessRegistrationForm
        lockAddress={Object.keys(event.locks)[0]}
        network={event.locks[Object.keys(event.locks)[0]].network}
      />
    )
  }

  const paywallConfig: PaywallConfig = {
    title: 'Registration',
    icon: 'metadata?.image', // Replace with event
    emailRequired: true,
    metadataInputs: [
      {
        name: 'fullname',
        label: 'Full name',
        defaultValue: '',
        type: 'text',
        required: true,
        placeholder: 'Satoshi Nakamoto',
        public: false,
      },
    ],
    locks: event.locks,
  }

  return (
    <>
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={paywallConfig}
          handleClose={() => {
            setCheckoutOpen(false)
            // reload() // TODO: force refresh after eventual purchase
          }}
        />
      </Modal>
      <Button
        variant="primary"
        size="medium"
        style={{
          backgroundColor: `#${event.background_color}`,
          color: `#${event.background_color}`
            ? fontColorContrast(`#${event.background_color}`)
            : 'white',
        }}
        disabled={isClaimableLoading}
        onClick={() => {
          setCheckoutOpen(true)
        }}
      >
        Register
      </Button>
    </>
  )
}

// For each of the locks
// We need to check first if the user has any
// if they do, show the "success" card
// If they don't, check if the event has a custom checkout (it will have the sold out details)
// if it does, then show it
// if it does not, check if the event is claimable (one lock that is free)
// if it does, then show the claim UI
// if it does not, show a checkout UI with the locks by default
export const RegistrationCard = ({ event }: RegistrationCardProps) => {
  const config = useConfig()

  // const { lock, isLockLoading } = useLockData({
  //   lockAddress,
  //   network,
  // })
  // const hasUnlimitedKeys = lock?.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
  // const keysLeft =
  //   Math.max(lock?.maxNumberOfKeys || 0, 0) - (lock?.outstandingKeys || 0)
  // const isSoldOut = keysLeft === 0 && !hasUnlimitedKeys

  // // Check of the event has a custom checkout!
  // const hasCheckoutId = settings?.checkoutConfigId

  // const showWalletLess = !hasValidKey && isClaimable
  // if (
  //   isClaimableLoading ||
  //   isLockLoading ||
  //   isHasValidKeyLoading ||
  //   isLoadingSettings
  // ) {
  //   return <Placeholder.Card size="md" />
  // }

  // if (hasCheckoutId) {
  //   return (
  //     <CheckoutRegistrationCard
  //       lockAddress={lockAddress}
  //       network={network}
  //       onPurchase={() => {
  //         console.log('purchase done!')
  //       }}
  //     />
  //   )
  // }

  return (
    <Card className="grid gap-6 mt-10 lg:mt-0">
      <div className="grid gap-6 md:gap-8">
        {Object.keys(event.locks)?.map((lockAddress: string) => {
          return (
            <LockPriceDetails
              key={lockAddress}
              lockAddress={lockAddress}
              network={event.locks[lockAddress].network}
              showContract
            />
          )
        })}
      </div>
      <RegistrationCardInternal event={event} />
      {/* <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={paywallConfig}
          handleClose={() => {
            setCheckoutOpen(false)
            // reload() // TODO: force refresh after eventual purchase
          }}
        />
      </Modal>
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
        <>
          <LockPriceDetails lockAddress={lockAddress} network={network} />
          {showWalletLess ? (
            <WalletlessRegistrationForm
              lockAddress={lockAddress}
              network={network}
              disabled={isSoldOut}
            />
          ) : (
            
          )}
        </>
      )} */}
    </Card>
  )
}
