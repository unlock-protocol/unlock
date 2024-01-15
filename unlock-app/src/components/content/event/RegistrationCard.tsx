import { useCanClaim } from '~/hooks/useCanClaim'
import { WalletlessRegistrationForm } from './WalletlessRegistration'
import { useValidKeyBulk } from '~/hooks/useKey'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { LockPriceDetails } from './LockPriceDetails'
import { Button, Card, Placeholder, Modal } from '@unlock-protocol/ui'
import Link from 'next/link'
import { Checkout } from '~/components/interface/checkout/main'
import { useState } from 'react'
import { selectProvider } from '~/hooks/useAuthenticate'
import { useConfig } from '~/utils/withConfig'
import { Event, PaywallConfigType } from '@unlock-protocol/core'

interface RegistrationCardProps {
  event: Event
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
}

export const RegistrationCardInternal = ({
  checkoutConfig,
}: RegistrationCardProps) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { account } = useAuth()
  const config = useConfig()
  const injectedProvider = selectProvider(config)

  const queries = useValidKeyBulk(checkoutConfig.config.locks)
  const refresh = () => {
    queries.map((query) => query.refetch())
  }

  const isLoadingValidKeys = queries?.some(
    (query) => query.isInitialLoading || query.isRefetching
  )
  const hasValidKey = queries?.map((query) => query.data).some((value) => value)

  const { isInitialLoading: isClaimableLoading, data: isClaimable } =
    useCanClaim(
      {
        recipients: [account || ZERO],
        lockAddress: Object.keys(checkoutConfig.config.locks)[0],
        network: (checkoutConfig.config.locks[
          Object.keys(checkoutConfig.config.locks)[0]
        ].network || checkoutConfig.config.network)!,
        data: [],
      },
      { enabled: Object.keys(checkoutConfig.config.locks).length === 1 }
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

  if (isClaimable) {
    return (
      <WalletlessRegistrationForm
        lockAddress={Object.keys(checkoutConfig.config.locks)[0]}
        network={
          (checkoutConfig.config.locks[
            Object.keys(checkoutConfig.config.locks)[0]
          ].network || checkoutConfig.config.network)!
        }
        refresh={refresh}
      />
    )
  }

  return (
    <>
      <Modal isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} empty={true}>
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={checkoutConfig.config}
          handleClose={() => {
            refresh()
            setCheckoutOpen(false)
          }}
        />
      </Modal>
      <Button
        variant="primary"
        size="medium"
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

export const RegistrationCard = ({
  event,
  checkoutConfig,
}: RegistrationCardProps) => {
  return (
    <Card className="grid gap-6 mt-10 lg:mt-0">
      <div className="grid gap-6 md:gap-8">
        {Object.keys(checkoutConfig.config.locks)?.map(
          (lockAddress: string) => {
            return (
              <LockPriceDetails
                key={lockAddress}
                lockAddress={lockAddress}
                network={
                  (checkoutConfig.config.locks[
                    Object.keys(checkoutConfig.config.locks)[0]
                  ].network || checkoutConfig.config.network)!
                }
                showContract
              />
            )
          }
        )}
      </div>
      <RegistrationCardInternal checkoutConfig={checkoutConfig} event={event} />
    </Card>
  )
}
