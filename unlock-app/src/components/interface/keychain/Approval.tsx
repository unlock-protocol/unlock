import { Button, Input, Modal } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'
import {
  approveTransfer,
  getErc20BalanceForAddress,
  getErc20Decimals,
  getErc20TokenSymbol,
} from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'

const IncreaseApprovalModalHolder = () => {
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
}

export const IncreaseApprovalModal = ({
  isOpen,
  lock,
  setIsOpen,
  account: owner,
  network,
}: Props) => {
  const walletService = useWalletService()
  const provider = walletService.providerForNetwork(network)
  const { address: lockAddress, tokenAddress } = lock ?? {}
  const [allowanceAmount, setAllowanceAmount] = useState<string>()
  const { isLoading: isApprovalCurrencyLoading, data: approvalCurrency } =
    useQuery(
      ['approval', lockAddress, network],
      async () => {
        const [symbol, decimal, balance] = await Promise.all([
          getErc20TokenSymbol(tokenAddress, provider),
          getErc20Decimals(tokenAddress, provider),
          getErc20BalanceForAddress(tokenAddress, owner, provider),
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

  const increaseAllowance = async (value: string) => {
    await approveTransfer(
      tokenAddress,
      lockAddress,
      value,
      provider,
      walletService.signer
    )
  }

  const increaseAllownace = useMutation(increaseAllowance, {
    onSuccess: () => {
      ToastHelper.success('Successfully increased the allowance.')
      setIsOpen(false)
    },
    onError: (err: any) => {
      ToastHelper.error(
        err?.error?.message ??
          err?.message ??
          'There was an error in increasing the allowance. Try again.'
      )
    },
  })

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {isApprovalCurrencyLoading ? (
        <IncreaseApprovalModalHolder />
      ) : (
        isOpen && (
          <div className="flex flex-col w-full gap-4">
            <div>
              <h3 className="text-xl font-bold"> Allowance </h3>
              <p className="text-gray-600">
                Set the amount in erc20 to be used for renewing this
                subscription.
              </p>
            </div>
            <Input
              type="number"
              onChange={(event) => {
                event.preventDefault()
                const amount = event.target.value
                setAllowanceAmount(amount)
              }}
              label={`Amount in ${approvalCurrency?.symbol}`}
            />
            <Button
              type="button"
              disabled={!allowanceAmount}
              onClick={(event) => {
                event.preventDefault()
                increaseAllownace.mutate(
                  ethers.utils
                    .parseUnits(
                      allowanceAmount!,
                      approvalCurrency?.decimal || 18
                    )
                    .toString()
                )
              }}
              loading={increaseAllownace.isLoading}
            >
              {increaseAllownace.isLoading
                ? 'Increasing allowance...'
                : 'Confirm'}
            </Button>
          </div>
        )
      )}
    </Modal>
  )
}
