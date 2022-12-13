import { Button, Input, Modal } from '@unlock-protocol/ui'
import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'
import {
  approveTransfer,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
  getAllowance,
} from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import type { KeyProps } from './Key'
import dayjs from 'dayjs'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MAX_UINT } from '~/constants'
import { ToggleSwitch } from '@unlock-protocol/ui'
import { durationAsText } from '~/utils/durations'
import { KeyItem } from './KeyInfoDrawer'

const ExtendMembershipPlaceholder = () => {
  return (
    <div data-testid="placeholder" className="flex flex-col w-full gap-5 p-4">
      <div className="flex flex-col gap-2">
        <div className="h-[24px] w-2/3 bg-slate-200 animate-pulse"></div>
        <div className="h-[14px] w-1/2 bg-slate-200 animate-pulse"></div>
      </div>
      <div className="h-[50px] w-full rounded-full bg-slate-200 animate-pulse"></div>
    </div>
  )
}

export interface Props {
  isOpen: boolean
  lock: any
  setIsOpen: (open: boolean) => void
  account: string
  currency: string
  tokenId: string
  network: number
  ownedKey: KeyProps
}

export const ExtendMembershipModal = ({
  isOpen,
  lock,
  setIsOpen,
  account: owner,
  network,
  ownedKey,
}: Props) => {
  const walletService = useWalletService()
  const provider = walletService.providerForNetwork(network)
  const { account } = useAuth()
  const { address: lockAddress, tokenAddress } = lock ?? {}
  const [renewalAmount, setRenewalAmount] = useState<string>('0')
  const [unlimited, setUnlimited] = useState(false)
  const { isLoading: isApprovalCurrencyLoading, data: approvalCurrency } =
    useQuery(
      ['approval', lockAddress, network],
      async () => {
        const [symbol, decimal, balance] = await Promise.all([
          getErc20TokenSymbol(tokenAddress, provider),
          getErc20Decimals(tokenAddress, provider),
          getErc20BalanceForAddress(tokenAddress, owner, provider),
          getAllowance(tokenAddress, lockAddress, provider, owner),
        ])
        return {
          symbol,
          decimal,
          balance,
        }
      },
      {
        retry: false,
      }
    )

  const isKeyExpired =
    ownedKey.expiration !== MAX_UINT
      ? dayjs.unix(parseInt(ownedKey.expiration)).isBefore(dayjs())
      : false

  const isERC20 =
    ownedKey.lock.tokenAddress &&
    ownedKey.lock.tokenAddress !== '0x0000000000000000000000000000000000000000'

  const isRenewable =
    ownedKey.lock.version >= 11 && ownedKey.expiration !== MAX_UINT && isERC20

  const extendMembership = async (value: string) => {
    await walletService.extendKey({
      lockAddress: lock?.address,
      tokenId: ownedKey.tokenId,
      referrer: account,
      recurringPayment: value,
      totalApproval: unlimited ? MAX_UINT : undefined,
      extendApprovalOnly: !isKeyExpired,
    })
  }

  const extend = useMutation(extendMembership, {
    onSuccess: () => {
      ToastHelper.success('Successfully increased the allowance.')
      setIsOpen(false)
    },
    onError: (err: any) => {
      console.error(err)
      ToastHelper.error("Something went wrong. Couldn't extend the membership")
    },
  })

  const message = useMemo(() => {
    if (!isRenewable && isKeyExpired) {
      return 'Your membership has expired. You can extend it by purchasing a new membership.'
    }
    if (isKeyExpired && isRenewable) {
      return 'Set the number of renewals you want the membership to renew. Since your membership has also expired, you will be charged for the extension automatically.'
    }
    if (isRenewable) {
      return 'Set the number of renewals you want the membership to renew.'
    }
    return 'You can extend your membership by purchasing a new membership.'
  }, [isRenewable, isKeyExpired])

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {isApprovalCurrencyLoading ? (
        <ExtendMembershipPlaceholder />
      ) : (
        isOpen && (
          <div className="flex flex-col w-full gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold"> Extend Membership </h3>
              <p className="text-gray-600">{message}</p>
            </div>
            <div className="divide-y">
              <KeyItem label="Price">
                {ethers.utils.formatUnits(
                  ownedKey.lock.price,
                  approvalCurrency?.decimal
                )}{' '}
                {approvalCurrency?.symbol}
              </KeyItem>
              <KeyItem label="Duration">
                {durationAsText(ownedKey.lock.expirationDuration)}
              </KeyItem>
            </div>
            {isRenewable && (
              <div>
                <div className="flex items-center justify-end w-full">
                  <ToggleSwitch
                    title="Unlimited Renewals"
                    enabled={unlimited}
                    size="small"
                    setEnabled={(enabled) => {
                      setRenewalAmount('0')
                      setUnlimited(enabled)
                    }}
                  />
                </div>
                <Input
                  type="number"
                  disabled={unlimited}
                  value={renewalAmount}
                  onChange={(event) => {
                    event.preventDefault()
                    const amount = event.target.value
                    setRenewalAmount(amount)
                  }}
                  label={`Number of renewals`}
                />
                {!unlimited && (
                  <div className="text-sm text-gray-600">
                    Your membership will renew for {renewalAmount} times and
                    will cost{' '}
                    {ethers.utils.formatUnits(
                      ethers.BigNumber.from(ownedKey.lock.price).mul(
                        renewalAmount || '1'
                      ),
                      approvalCurrency?.decimal
                    )}{' '}
                    {approvalCurrency?.symbol}
                  </div>
                )}
              </div>
            )}
            <Button
              type="button"
              disabled={extend.isLoading || isApprovalCurrencyLoading}
              onClick={(event) => {
                event.preventDefault()
                extend.mutate(renewalAmount)
              }}
              loading={extend.isLoading}
            >
              {extend.isLoading ? 'Extending membership' : 'Extend membership'}
            </Button>
          </div>
        )
      )}
    </Modal>
  )
}
