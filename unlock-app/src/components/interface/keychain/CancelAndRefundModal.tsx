import { Button, Modal } from '@unlock-protocol/ui'
import React, { useState, useEffect } from 'react'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'
import Loading from '../Loading'

export interface ICancelAndRefundProps {
  isOpen: boolean
  lock: any
  setIsOpen: (open: boolean) => void
  account: string
  currency: string
  keyId: string
}

export const CancelAndRefundModal: React.FC<ICancelAndRefundProps> = ({
  isOpen,
  lock,
  setIsOpen,
  account: owner,
  currency,
  keyId,
}) => {
  const [loading, setLoading] = useState(false)
  const [loadingAmount, setLoadingAmount] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const walletService = useWalletService()
  const { address: lockAddress, tokenAddress } = lock ?? {}

  useEffect(() => {
    if (!isOpen) return
    const getRefundAmount = async () => {
      setLoadingAmount(true)
      const params = {
        lockAddress,
        owner,
        tokenAddress,
        tokenId: keyId,
      }
      const totalToRefund = await walletService.getCancelAndRefundValueFor(
        params,
        {} /** transactionParams */,
        () => true
      )
      setRefundAmount(totalToRefund)
      setLoadingAmount(false)
    }
    getRefundAmount()
  }, [
    isOpen,
    setRefundAmount,
    setLoadingAmount,
    lockAddress,
    tokenAddress,
    keyId,
    owner,
    walletService,
  ])

  const onCancelAndRefund = async () => {
    setLoading(true)

    const params = {
      lockAddress,
      tokenId: keyId,
    }

    try {
      await walletService.cancelAndRefund(
        params,
        {} /** transactionParams */,
        () => true
      )
      setIsOpen(false)
      ToastHelper.success('Key cancelled and successfully refunded.')
      // reload page to show updated list of keys
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setIsOpen(false)
      ToastHelper.error(
        err?.error?.message ??
          err?.message ??
          'There was an error in refund process. Please try again.'
      )
    }
  }

  if (!lock) return <span>No lock selected</span>
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col w-full gap-3 px-8 py-4">
        {loadingAmount ? (
          <Loading />
        ) : (
          <>
            <h3 className="text-black-500">Cancel and Refund</h3>
            <p className="text-sm">
              <span>
                {currency} {parseFloat(refundAmount!).toFixed(6)}
              </span>
              {` will be refunded, Do you want to proceed?`}
            </p>
          </>
        )}
        <Button
          type="button"
          onClick={onCancelAndRefund}
          disabled={loading || loadingAmount}
        >
          {loading ? (
            <Loading size={20} />
          ) : (
            <span className="ml-2">Confirm</span>
          )}
        </Button>
      </div>
    </Modal>
  )
}
