import networks from '@unlock-protocol/networks'
import { Button, Modal } from '@unlock-protocol/ui'
import { Web3Service } from '@unlock-protocol/unlock-js'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'

export interface ICancelAndRefundProps {
  active: boolean
  lock: any
  setIsOpen: (status: boolean) => void
  account: string
  currency: string
  keyId: string
  network: number
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

const MAX_TRANSFER_FEE = 10000

export const CancelAndRefundModal: React.FC<ICancelAndRefundProps> = ({
  active,
  lock,
  setIsOpen,
  account: owner,
  currency,
  keyId,
  network,
}) => {
  const [isRefundable, setIsRefundable] = useState(false)
  const [hasMaxCancellationFee, setHasMaxCancellationFee] = useState(false)
  const walletService = useWalletService()
  const { address: lockAddress, tokenAddress } = lock ?? {}

  const getRefundAmount = async () => {
    if (!active) return

    const params = {
      lockAddress,
      owner,
      tokenAddress,
      tokenId: keyId,
    }
    if (!walletService) return
    return await walletService.getCancelAndRefundValueFor(params, () => true)
  }

  const getCancellationFee = async () => {
    const web3Service = new Web3Service(networks)
    return await web3Service.transferFeeBasisPoints(lockAddress, network)
  }

  const getLockDetails = async () => {
    const web3Service = new Web3Service(networks)
    return await web3Service.getLock(lock.address, network)
  }

  const { isLoading, data: refundAmount = 0 } = useQuery([active], () =>
    getRefundAmount()
  )

  const { isLoading: isLoadingCancellationFee, data: transferFee = 0 } =
    useQuery([active, refundAmount], () => getCancellationFee())

  const { isLoading: isLoadingLockDetails, data: lockDetails } = useQuery(
    [active],
    () => getLockDetails()
  )

  const onCancelAndRefund = async () => {
    const params = {
      lockAddress,
      tokenId: keyId,
    }

    try {
      await walletService.cancelAndRefund(params, () => true)
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

  const maxFeeReached = transferFee >= MAX_TRANSFER_FEE
  const canRefund =
    !maxFeeReached && Number(lockDetails?.balance) < refundAmount

  useEffect(() => {
    setIsRefundable(canRefund)
    setHasMaxCancellationFee(maxFeeReached)
  }, [canRefund, maxFeeReached])

  const loading = isLoading || isLoadingCancellationFee || isLoadingLockDetails

  if (!lock) return <span>No lock selected</span>

  return (
    <Modal isOpen={active} setIsOpen={setIsOpen}>
      {loading ? (
        <CancelAndRefundModalPlaceHolder />
      ) : (
        <div className="flex flex-col w-full gap-5 p-4">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-black-500 text-left">
              Cancel and Refund
            </h3>
            <p className="text-md mt-2">
              {hasMaxCancellationFee ? (
                <span>This key is not refundable.</span>
              ) : isRefundable ? (
                <>
                  <span>
                    {currency} {parseFloat(refundAmount!).toFixed(3)}
                  </span>
                  {` will be refunded, Do you want to proceed?`}
                </>
              ) : (
                <span>
                  Refund is not possible because the contract does not have
                  funds to cover.
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
