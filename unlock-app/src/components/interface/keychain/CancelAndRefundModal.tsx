import networks from '@unlock-protocol/networks'
import { Button, Modal } from '@unlock-protocol/ui'
import { Web3Service } from '@unlock-protocol/unlock-js'
import React from 'react'
import { useQuery, useMutation } from 'react-query'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '../../helpers/toast.helper'
import { FaSpinner as Spinner } from 'react-icons/fa'
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
  const walletService = useWalletService()
  const { address: lockAddress, tokenAddress } = lock ?? {}

  const getRefundAmount = async () => {
    if (!active) return

    const params = {
      lockAddress,
      owner,
      tokenAddress,
      network,
      tokenId: keyId,
    }
    if (!walletService) return
    return walletService.getCancelAndRefundValueFor(params)
  }

  const getCancellationFee = async () => {
    const web3Service = new Web3Service(networks)
    return web3Service.transferFeeBasisPoints(lockAddress, network)
  }

  const getLockBalance = async () => {
    const web3Service = new Web3Service(networks)
    return web3Service.getAddressBalance(lockAddress, network)
  }

  const cancelAndRefund = async () => {
    const params = {
      lockAddress,
      tokenId: keyId,
    }
    return walletService.cancelAndRefund(params, () => true)
  }

  const { isLoading, data: refundAmount = 0 } = useQuery(
    ['getRefundAmount', active, lockAddress],
    () => getRefundAmount(),
    {
      refetchInterval: false,
    }
  )

  const { isLoading: isLoadingCancellationFee, data: transferFee } = useQuery(
    ['getCancellationFee', active, lockAddress],
    () => getCancellationFee(),
    {
      refetchInterval: false,
    }
  )

  const { isLoading: isLoadingLockDetails, data: lockBalance } = useQuery(
    ['getLockBalance', active, lockAddress],
    () => getLockBalance(),
    {
      refetchInterval: false,
    }
  )

  const cancelRefundMutation = useMutation(cancelAndRefund, {
    onSuccess: () => {
      ToastHelper.success('Key cancelled and successfully refunded.')
      setIsOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
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

  const loading = isLoading || isLoadingCancellationFee || isLoadingLockDetails

  const buttonDisabled =
    loading || !isRefundable || cancelRefundMutation?.isLoading

  if (!lock) return <span>No lock selected</span>

  return (
    <Modal isOpen={active} setIsOpen={setIsOpen}>
      {loading ? (
        <CancelAndRefundModalPlaceHolder />
      ) : (
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
            onClick={() => cancelRefundMutation.mutate()}
            disabled={buttonDisabled}
          >
            <div className="flex items-center">
              {cancelRefundMutation.isLoading && (
                <Spinner className="animate-spin" />
              )}
              <span className="ml-2">Confirm</span>
            </div>
          </Button>
        </div>
      )}
    </Modal>
  )
}
