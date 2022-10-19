import { Button, Modal } from '@unlock-protocol/ui'
import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'
import { FaSpinner as Spinner } from 'react-icons/fa'
import { useKeychain } from '~/hooks/useKeychain'

export interface CancelAndRefundProps {
  isOpen: boolean
  lock: any
  setIsOpen: (open: boolean) => void
  account: string
  currency: string
  tokenId: string
  network: number
  onExpireAndRefund?: () => void
}

const CancelAndRefundModalPlaceHolder = () => {
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

const MAX_TRANSFER_FEE = 10000

export const CancelAndRefundModal = ({
  isOpen,
  lock,
  setIsOpen,
  account: owner,
  currency,
  tokenId,
  network,
  onExpireAndRefund,
}: CancelAndRefundProps) => {
  const walletService = useWalletService()
  const { address: lockAddress, tokenAddress } = lock ?? {}

  const { getAmounts } = useKeychain({
    lockAddress,
    network,
    owner,
    keyId: tokenId,
    tokenAddress,
  })

  const { isInitialLoading: isLoading, data } = useQuery(
    ['getAmounts', lockAddress],
    getAmounts,
    {
      refetchInterval: false,
      onError: () => {
        ToastHelper.error('There is some unexpected error, please try again')
      },
    }
  )

  const { refundAmount = 0, transferFee = 0, lockBalance = 0 } = data ?? {}

  const cancelAndRefund = async () => {
    const params = {
      lockAddress,
      tokenId,
    }
    return walletService.cancelAndRefund(
      params,
      {} /** transactionParams */,
      () => true
    )
  }

  const cancelRefundMutation = useMutation(cancelAndRefund, {
    onSuccess: () => {
      ToastHelper.success('Key cancelled and successfully refunded.')
      setIsOpen(false)
      if (typeof onExpireAndRefund === 'function') {
        onExpireAndRefund()
      }
    },
    onError: (err: any) => {
      setIsOpen(false)
      ToastHelper.error(
        err?.error?.message ??
          err?.message ??
          'There was an error in refund process. Please try again.'
      )
    },
  })

  const hasMaxCancellationFee = Number(transferFee) >= MAX_TRANSFER_FEE
  const isRefundable =
    !hasMaxCancellationFee && refundAmount <= Number(lockBalance)

  const buttonDisabled =
    isLoading || !isRefundable || cancelRefundMutation?.isLoading

  if (!lock) return <span>No lock selected</span>

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {isLoading ? (
        <CancelAndRefundModalPlaceHolder />
      ) : (
        isOpen && (
          <div className="flex flex-col w-full gap-5 p-4">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-left text-black-500">
                Cancel and Refund
              </h3>
              <p className="mt-2 text-md">
                {hasMaxCancellationFee ? (
                  <span>This key is not refundable.</span>
                ) : isRefundable ? (
                  <>
                    <span>
                      {currency} {parseFloat(`${refundAmount}`!).toFixed(3)}
                    </span>
                    {` will be refunded, Do you want to proceed?`}
                  </>
                ) : (
                  <span>
                    Refund is not possible because the contract does not have
                    funds to cover it.
                  </span>
                )}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => cancelRefundMutation.mutate()}
              disabled={buttonDisabled}
            >
              <div className="flex items-center">
                {cancelRefundMutation.isLoading && (
                  <Spinner className="animate-spin" />
                )}
                <span className="ml-2">
                  {cancelRefundMutation.isLoading ? 'Refunding...' : 'Confirm'}
                </span>
              </div>
            </Button>
          </div>
        )
      )}
    </Modal>
  )
}
