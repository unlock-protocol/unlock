import { Button, Modal } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'

export interface ICancelAndRefundProps {
  active: boolean
  lock: any
  dismiss: (status: boolean) => void
  account: string
  currency: string
  keyId: string
}

const CancelAndRefundModalPlaceHolder = () => {
  return (
    <div className="flex flex-col w-full gap-5 p-4">
      <div className="flex flex-col gap-2">
        <div className="h-[24px] w-2/3 bg-slate-200 animate-pulse"></div>
        <div className="h-[14px] w-1/2 bg-slate-200 animate-pulse"></div>
      </div>
      <div className="h-[50px] w-full rounded-full bg-slate-200 animate-pulse"></div>
    </div>
  )
}

export const CancelAndRefundModal: React.FC<ICancelAndRefundProps> = ({
  active,
  lock,
  dismiss,
  account: owner,
  currency,
  keyId,
}) => {
  const [isRefundable, setIsRefundable] = useState(false)
  const walletService = useWalletService()
  const { address: lockAddress, tokenAddress } = lock ?? {}

  const getRefundAmount = async () => {
    const params = {
      lockAddress,
      owner,
      tokenAddress,
      tokenId: keyId,
    }
    return await walletService.getCancelAndRefundValueFor(params, () => true)
  }

  const { isLoading: loading, data: refundAmount = 0 } = useQuery(
    [active, owner, tokenAddress, keyId, lockAddress],
    () => getRefundAmount()
  )

  const onCancelAndRefund = async () => {
    const params = {
      lockAddress,
      tokenId: keyId,
    }

    try {
      await walletService.cancelAndRefund(params, () => true)
      ToastHelper.success('Key cancelled and successfully refunded.')
      // reload page to show updated list of keys
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      ToastHelper.error(
        err?.error?.message ??
          err?.message ??
          'There was an error in refund process. Please try again.'
      )
    }
  }

  if (!lock) return <span>No lock selected</span>

  return (
    <Modal isOpen={active} setIsOpen={dismiss}>
      {loading ? (
        <CancelAndRefundModalPlaceHolder />
      ) : (
        <div className="flex flex-col w-full gap-5 p-4">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-black-500 text-left">
              Cancel and Refund
            </h3>
            <p className="text-md mt-2">
              {isRefundable ? (
                <>
                  <span>
                    {currency} {parseFloat(refundAmount!).toFixed(6)}
                  </span>
                  {` will be refunded, Do you want to proceed?`}
                </>
              ) : (
                <span>
                  Refund is not possible because the contract does not have
                  funds to cover
                </span>
              )}
            </p>
          </div>
          <Button
            type="button"
            onClick={onCancelAndRefund}
            disabled={loading || !isRefundable}
          >
            <span className="ml-2">Confirm</span>
          </Button>
        </div>
      )}
    </Modal>
  )
}
