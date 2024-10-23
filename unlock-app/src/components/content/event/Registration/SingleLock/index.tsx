import { useCanClaim } from '~/hooks/useCanClaim'
import {
  WalletlessRegistrationApply,
  WalletlessRegistrationClaim,
} from '../WalletlessRegistration'
import { LockPriceInternals } from '../LockPriceDetails'
import { useGetLockCurrencySymbol } from '~/hooks/useSymbol'
import { ADDRESS_ZERO, UNLIMITED_KEYS_COUNT } from '~/constants'
import { useLockData } from '~/hooks/useLockData'
import { EmbeddedCheckout } from '../EmbeddedCheckout'
import { PaywallConfigType } from '@unlock-protocol/core'
import { emailInput } from '~/components/interface/checkout/main/Metadata'
import { LoadingRegistrationCard } from '../LoadingRegistrationCard'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export interface RegistrationCardSingleLockProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
  refresh: any
  requiresApproval: boolean
  hideRemaining: boolean
}

export const RegistrationCardSingleLock = ({
  checkoutConfig,
  refresh,
  requiresApproval,
  hideRemaining,
}: RegistrationCardSingleLockProps) => {
  const lockAddress = Object.keys(checkoutConfig.config.locks)[0]
  const network = (checkoutConfig.config.locks[lockAddress].network ||
    checkoutConfig.config.network)!

  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })

  const { account } = useAuthenticate()

  const { isInitialLoading: isClaimableLoading, data: canClaim } = useCanClaim(
    {
      recipients: [account || ADDRESS_ZERO],
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
    return <LoadingRegistrationCard />
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
            hideRemaining={hideRemaining}
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
