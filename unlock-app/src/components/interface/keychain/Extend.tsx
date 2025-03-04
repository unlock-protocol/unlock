import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '@unlock-protocol/ui'
import {
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
  getAllowance,
  approveTransfer,
} from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { ADDRESS_ZERO, MAX_UINT, UNLIMITED_RENEWAL_LIMIT } from '~/constants'
import { ToggleSwitch } from '@unlock-protocol/ui'
import { durationAsText } from '~/utils/durations'
import { KeyItem } from './KeyInfoDrawer'
import { config } from '~/config/app'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Placeholder } from '@unlock-protocol/ui'
import { Key } from '~/hooks/useKeys'
import { getReferrer } from '~/utils/checkoutLockUtils'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

const ExtendMembershipPlaceholder = () => {
  return (
    <Placeholder.Root
      data-testid="placeholder"
      className="flex flex-col w-full gap-5 p-4"
    >
      <div className="flex flex-col gap-2">
        <Placeholder.Line />
        <Placeholder.Line />
      </div>
      <Placeholder.Line size="lg" />
    </Placeholder.Root>
  )
}

export interface Props {
  isOpen: boolean
  lock: any
  setIsOpen: (open: boolean) => void
  owner: string
  currency: string
  tokenId: string
  network: number
  ownedKey: Key
}

export const ExtendMembershipModal = ({
  isOpen,
  lock,
  setIsOpen,
  owner,
  network,
  ownedKey,
}: Props) => {
  const web3Service = useWeb3Service()
  const provider = web3Service.providerForNetwork(network)
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const { address: lockAddress, tokenAddress } = lock ?? {}
  const [renewalAmount, setRenewalAmount] = useState(BigInt(0))
  const [unlimited, setUnlimited] = useState(false)
  const { isRenewable, isExpired: isKeyExpired, isERC20 } = ownedKey
  const {
    data: lockExpirationDuration,
    isLoading: isLockExpirationDurationLoading,
  } = useQuery({
    queryKey: ['expiration', lockAddress, network],
    queryFn: async () => {
      const contract = await web3Service.lockContract(lockAddress, network)
      const duration = await contract.expirationDuration()
      return duration?.toString() || ownedKey.lock.expirationDuration
    },
  })

  const { isPending: isRenewalInfoLoading, data: renewalInfo } = useQuery({
    queryKey: ['approval', lockAddress, network],
    queryFn: async () => {
      if (
        ownedKey.lock.tokenAddress &&
        ownedKey.lock.tokenAddress === ADDRESS_ZERO
      ) {
        const nativeCurrency = config.networks[network]?.nativeCurrency
        return {
          symbol: nativeCurrency?.symbol,
          decimal: nativeCurrency?.decimals,
          balance: await web3Service.getAddressBalance(account!, network),
          allowance: BigInt(0),
          renewals: BigInt(0),
        }
      }
      const [symbol, decimal, balance, allowance] = await Promise.all([
        getErc20TokenSymbol(tokenAddress, provider),
        getErc20Decimals(tokenAddress, provider),
        getErc20BalanceForAddress(tokenAddress, owner, provider),
        getAllowance(tokenAddress, lockAddress, provider, owner),
      ])
      return {
        symbol,
        decimal,
        balance,
        allowance,
        renewals: allowance / ownedKey.lock.price,
      }
    },
    retry: 2,
  })

  const extendMembership = async (renewal?: number) => {
    const walletService = await getWalletService(network)

    if (isERC20 && isRenewable && !isKeyExpired && (!!renewal || unlimited)) {
      await approveTransfer(
        ownedKey.lock.tokenAddress,
        lockAddress,
        unlimited
          ? MAX_UINT
          : BigInt(renewal?.toString() || '1') * ownedKey.lock.price.toString(),
        provider,
        walletService.signer
      )
    } else {
      await walletService.extendKey({
        lockAddress: lock?.address,
        tokenId: ownedKey.tokenId,
        referrer: getReferrer(account!),
        recurringPayment: renewal ? renewal : undefined,
        totalApproval: unlimited ? MAX_UINT : undefined,
      })
    }
  }

  const extend = useMutation({
    mutationFn: extendMembership,
    onSuccess: () => {
      ToastHelper.success('Successfully extended the membership!')
      setIsOpen(false)
    },
    meta: {
      errorMessage: "Something went wrong. Couldn't extend the membership.",
    },
  })

  const message = useMemo(() => {
    if (!isRenewable && isKeyExpired) {
      return 'Your membership has expired. You can extend for the duration below.'
    }
    if (isKeyExpired && isRenewable) {
      return 'Set the number of times you want the membership to renew. Since your membership has also expired, you will be charged for the extension automatically.'
    }
    if (isRenewable) {
      return 'Set the number of times you want the membership to renew.'
    }
    return 'Extend the membership for the duration below.'
  }, [isRenewable, isKeyExpired])

  const isLoading = isLockExpirationDurationLoading || isRenewalInfoLoading

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {isLoading && <ExtendMembershipPlaceholder />}
      {!isLoading && (
        <div className="flex flex-col w-full gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold"> Extend Membership </h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold"> Membership Details </h3>
            <div className="divide-y">
              <KeyItem label="Price">
                {ethers.formatUnits(ownedKey.lock.price, renewalInfo?.decimal)}{' '}
                {renewalInfo?.symbol}
              </KeyItem>
              <KeyItem label="Duration">
                {lockExpirationDuration &&
                  durationAsText(lockExpirationDuration)}
              </KeyItem>
            </div>
          </div>
          {isRenewable && (
            <div>
              <h3 className="text-lg font-bold"> Current validity</h3>
              <div className="divide-y">
                {renewalInfo?.renewals && (
                  <KeyItem label="Renews">
                    {renewalInfo.renewals >= UNLIMITED_RENEWAL_LIMIT
                      ? 'Unlimited'
                      : `${renewalInfo.renewals.toString()} times`}
                  </KeyItem>
                )}
              </div>
            </div>
          )}
          {isRenewable && (
            <div>
              <div className="flex items-center justify-end w-full">
                <ToggleSwitch
                  title="Unlimited Renewals"
                  enabled={unlimited}
                  size="small"
                  setEnabled={(enabled) => {
                    setRenewalAmount(BigInt(0))
                    setUnlimited(enabled)
                  }}
                />
              </div>
              <Input
                type="number"
                pattern="\d*"
                disabled={unlimited}
                value={renewalAmount.toString()}
                onChange={(event) => {
                  event.preventDefault()
                  const amount = parseInt(event.target.value)
                  setRenewalAmount(BigInt(amount))
                }}
                label={'Number of renewals'}
              />
              {!unlimited && !!renewalAmount && (
                <div className="text-sm text-gray-600">
                  Your membership will renew for {renewalAmount} times and will
                  cost{' '}
                  {ethers.formatUnits(
                    BigInt(ownedKey.lock.price) * (renewalAmount || BigInt(1)),
                    renewalInfo?.decimal
                  )}{' '}
                  {renewalInfo?.symbol}
                </div>
              )}
            </div>
          )}
          <Button
            type="button"
            disabled={extend.isPending || isRenewalInfoLoading}
            onClick={(event) => {
              event.preventDefault()
              extend.mutate(parseInt(renewalAmount.toString()))
            }}
            loading={extend.isPending}
          >
            {extend.isPending ? 'Extending membership' : 'Extend membership'}
          </Button>
        </div>
      )}
    </Modal>
  )
}
