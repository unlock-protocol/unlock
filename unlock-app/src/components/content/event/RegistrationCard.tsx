import fontColorContrast from 'font-color-contrast'
import { PaywallConfig } from '~/unlockTypes'
import { useCanClaim } from '~/hooks/useCanClaim'
import { WalletlessRegistrationForm } from './WalletlessRegistration'
import { useValidKey } from '~/hooks/useKey'
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
import { useGetLockSettings } from '~/hooks/useLockSettings'
import { CheckoutRegistrationCard } from './CheckoutRegistrationCard'

interface RegistrationCardProps {
  lockAddress: string
  network: number
  metadata: any
}

export const RegistrationCard = ({
  lockAddress,
  network,
  metadata,
}: RegistrationCardProps) => {
  const config = useConfig()

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { account } = useAuth()

  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })
  const hasUnlimitedKeys = lock?.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
  const keysLeft =
    Math.max(lock?.maxNumberOfKeys || 0, 0) - (lock?.outstandingKeys || 0)
  const isSoldOut = keysLeft === 0 && !hasUnlimitedKeys

  const { isLoading: isClaimableLoading, data: isClaimable } = useCanClaim({
    recipients: [account || ZERO],
    lockAddress,
    network,
    data: [],
  })

  // Get the lock's settings to see if there is a custom checkout attached
  const { isLoading: isLoadingSettings, data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })
  const hasCheckoutId = settings?.checkoutConfigId

  const { data: hasValidKey, isInitialLoading: isHasValidKeyLoading } =
    useValidKey({
      lockAddress,
      network,
    })

  const showWalletLess = !hasValidKey && isClaimable
  if (
    isClaimableLoading ||
    isLockLoading ||
    isHasValidKeyLoading ||
    isLoadingSettings
  ) {
    return <Placeholder.Card size="md" />
  }

  const injectedProvider = selectProvider(config)

  const paywallConfig: PaywallConfig = {
    title: 'Registration',
    icon: metadata?.image,
    locks: {
      [lockAddress]: {
        network,
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
      },
    },
  }

  if (hasCheckoutId) {
    return (
      <CheckoutRegistrationCard
        lockAddress={lockAddress}
        network={network}
        onPurchase={() => {
          console.log('purchase done!')
        }}
      />
    )
  }

  return (
    <Card className="grid gap-6 mt-10 lg:mt-0">
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
            <Button
              variant="primary"
              size="medium"
              style={{
                backgroundColor: `#${eventData.background_color}`,
                color: `#${eventData.background_color}`
                  ? fontColorContrast(`#${eventData.background_color}`)
                  : 'white',
              }}
              disabled={isClaimableLoading || isSoldOut}
              onClick={() => {
                setCheckoutOpen(true)
              }}
            >
              Register
            </Button>
          )}
        </>
      )}
    </Card>
  )
}
