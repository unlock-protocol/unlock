import { useCanClaim } from '~/hooks/useCanClaim'
import { WalletlessRegistrationForm } from '../../WalletlessRegistration'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { LockPriceInternals } from '../LockPriceDetails'
import { Placeholder } from '@unlock-protocol/ui'
import { useGetLockCurrencySymbol } from '~/hooks/useSymbol'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useLockData } from '~/hooks/useLockData'
import { EmbeddedCheckout } from '../EmbeddedCheckout'
import { PaywallConfigType } from '@unlock-protocol/core'

export interface RegistrationCardSingleLockProps {
  checkoutConfig: {
    id?: string
    config: PaywallConfigType
  }
  refresh: any
}

export const RegistrationCardSingleLock = ({
  checkoutConfig,
  refresh,
}: RegistrationCardSingleLockProps) => {
  const lockAddress = Object.keys(checkoutConfig.config.locks)[0]
  const network = (checkoutConfig.config.locks[lockAddress].network ||
    checkoutConfig.config.network)!

  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })

  const { account } = useAuth()
  const { isInitialLoading: isClaimableLoading, data: isClaimable } =
    useCanClaim(
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

  const { data: symbol } = useGetLockCurrencySymbol({
    lockAddress,
    network,
    contractAddress: lock?.currencyContractAddress,
  })

  if (isLockLoading || isClaimableLoading || !lock) {
    return (
      <Placeholder.Root inline>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
      </Placeholder.Root>
    )
  }

  return (
    <>
      <LockPriceInternals
        lock={lock}
        network={network}
        symbol={symbol}
        price={price!}
        hasUnlimitedKeys={hasUnlimitedKeys}
        isSoldOut={isSoldOut}
        keysLeft={keysLeft}
        showContract={true}
      />
      {isClaimable && (
        <WalletlessRegistrationForm
          lockAddress={Object.keys(checkoutConfig.config.locks)[0]}
          network={
            (checkoutConfig.config.locks[
              Object.keys(checkoutConfig.config.locks)[0]
            ].network || checkoutConfig.config.network)!
          }
          refresh={refresh}
        />
      )}
      {!isClaimable && (
        <EmbeddedCheckout checkoutConfig={checkoutConfig} refresh={refresh} />
      )}
    </>
  )
}
