import { useCanClaim } from '~/hooks/useCanClaim'
import {
  WalletlessRegistrationApply,
  WalletlessRegistrationClaim,
} from '../WalletlessRegistration'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { LockPriceInternals } from '../LockPriceDetails'
import { Placeholder } from '@unlock-protocol/ui'
import { useGetLockCurrencySymbol } from '~/hooks/useSymbol'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useLockData } from '~/hooks/useLockData'
import { EmbeddedCheckout } from '../EmbeddedCheckout'
import { PaywallConfigType } from '@unlock-protocol/core'
import { emailInput } from '~/components/interface/checkout/main/Metadata'

export interface RegistrationCardSingleLockProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
  refresh: any
  requiresApproval: boolean
}

export const RegistrationCardSingleLock = ({
  checkoutConfig,
  refresh,
  requiresApproval,
}: RegistrationCardSingleLockProps) => {
  const lockAddress = Object.keys(checkoutConfig.config.locks)[0]
  const network = (checkoutConfig.config.locks[lockAddress].network ||
    checkoutConfig.config.network)!

  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })

  const { account } = useAuth()

  const { isInitialLoading: isClaimableLoading, data: canClaim } = useCanClaim(
    {
      recipients: [account || ZERO],
      lockAddress,
      network,
      data: [],
    },
    { enabled: Object.keys(checkoutConfig.config.locks).length === 1 }
  )

  const price =
    lock?.keyPrice && parseFloat(lock?.keyPrice) === 0 ? 'FREE' : lock?.keyPrice

  const keysLeft =
    Math.max(lock?.maxNumberOfKeys || 0, 0) - (lock?.outstandingKeys || 0)

  const hasUnlimitedKeys = lock?.maxNumberOfKeys === UNLIMITED_KEYS_COUNT

  const isSoldOut = keysLeft === 0 && !hasUnlimitedKeys

  const isClaimable = canClaim && !isSoldOut

  const { data: symbol } = useGetLockCurrencySymbol({
    lockAddress,
    network,
    contractAddress: lock?.currencyContractAddress,
  })

  const showApplication = requiresApproval || lock?.maxNumberOfKeys == 0

  if (isLockLoading || isClaimableLoading || !lock) {
    return (
      <Placeholder.Root inline>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="lg" />
      </Placeholder.Root>
    )
  }

  const metadataInputs =
    checkoutConfig.config.metadataInputs ||
    checkoutConfig.config.locks[lockAddress].metadataInputs
  const emailRequired =
    checkoutConfig.config.emailRequired ||
    checkoutConfig.config.locks[lockAddress].emailRequired

  return (
    <>
      {!showApplication && (
        <>
          <LockPriceInternals
            lockCheckoutConfig={checkoutConfig.config.locks[lockAddress]}
            lock={lock}
            network={network}
            symbol={symbol}
            price={price!}
            hasUnlimitedKeys={hasUnlimitedKeys}
            isSoldOut={isSoldOut}
            keysLeft={keysLeft}
            showContract={true}
          />
          {!isSoldOut && isClaimable && (
            <WalletlessRegistrationClaim
              metadataInputs={
                emailRequired && metadataInputs
                  ? [emailInput, ...metadataInputs]
                  : metadataInputs
              }
              lockAddress={lockAddress}
              network={network}
              refresh={refresh}
            />
          )}
          {!isSoldOut && !isClaimable && (
            <EmbeddedCheckout
              checkoutConfig={checkoutConfig}
              refresh={refresh}
            />
          )}
        </>
      )}
      {showApplication && (
        <WalletlessRegistrationApply
          metadataInputs={
            emailRequired && metadataInputs
              ? [emailInput, ...metadataInputs]
              : metadataInputs
          }
          lockAddress={lockAddress}
          network={network}
        />
      )}
    </>
  )
}
