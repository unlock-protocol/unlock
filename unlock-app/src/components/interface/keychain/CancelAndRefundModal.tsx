import { Button, Modal, Placeholder, PriceFormatter } from '@unlock-protocol/ui'
import React, { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BiCopy as CopyIcon } from 'react-icons/bi'

import { ToastHelper } from '../../helpers/toast.helper'
import { useKeychain } from '~/hooks/useKeychain'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { addressMinify } from '~/utils/strings'
import useClipboard from 'react-use-clipboard'
import { useProvider } from '~/hooks/useProvider'

export interface CancelAndRefundProps {
  isOpen: boolean
  lock: any
  setIsOpen: (open: boolean) => void
  owner: string
  currency: string
  tokenId: string
  network: number
  onExpireAndRefund?: () => void
}

const MAX_TRANSFER_FEE = 10000

export const CancelAndRefundModal = ({
  isOpen,
  lock,
  setIsOpen,
  owner,
  currency,
  tokenId,
  network,
  onExpireAndRefund,
}: CancelAndRefundProps) => {
  const { getWalletService } = useProvider()
  const { address: lockAddress, tokenAddress } = lock ?? {}

  const { getAmounts } = useKeychain({
    lockAddress,
    network: parseInt(`${network}`),
    owner,
    keyId: tokenId,
    tokenAddress,
  })

  const { isLoading, data } = useQuery({
    queryKey: ['getAmounts', lockAddress],
    queryFn: getAmounts,
    enabled: isOpen, // execute query only when the modal is open
    refetchInterval: false,
    meta: {
      errorMessage:
        'We could not retrieve the refund amount for this membership.',
    },
  })

  const web3Service = useWeb3Service()
  const { data: keyManager, isPending: isLoadingKeykManager } = useQuery({
    queryKey: ['keyManagerOf', lockAddress, tokenId, network],
    queryFn: async () => {
      return await web3Service.keyManagerOf(lockAddress, tokenId, network)
    },
  })

  const { refundAmount = 0, transferFee = 0, lockBalance = 0 } = data ?? {}
  const isNotOwnerOftheKey = owner !== keyManager
  const cancelAndRefund = async () => {
    const params = {
      lockAddress,
      tokenId,
    }
    const walletService = await getWalletService(network)

    return walletService.cancelAndRefund(
      params,
      {} /** transactionParams */,
      () => true
    )
  }

  const cancelRefundMutation = useMutation({
    mutationFn: cancelAndRefund,
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
    isLoading ||
    !isRefundable ||
    cancelRefundMutation.isPending ||
    isLoadingKeykManager ||
    isNotOwnerOftheKey

  const [isCopied, setCopied] = useClipboard(keyManager, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success('Key manager address copied')
  }, [isCopied])

  if (!lock) return <span>No lock selected</span>
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {isLoading ? (
        <Placeholder.Root>
          <Placeholder.Line width="md" />
          <Placeholder.Line width="sm" size="sm" />
          <Placeholder.Line width="xl" size="sm" />
          <Placeholder.Line size="xl" />
        </Placeholder.Root>
      ) : (
        isOpen && (
          <div className="flex flex-col w-full gap-5">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-left text-black-500">
                Cancel and Refund
              </h3>
              <p className="mt-2 text-md">
                {isNotOwnerOftheKey ? (
                  <span>
                    You cannot cancel this membership, because you are not its
                    manager. The manager is {addressMinify(keyManager)}
                    <Button
                      variant="borderless"
                      className="inline-flex items-center px-1"
                      style={{ verticalAlign: 'sub' }}
                      onClick={setCopied}
                    >
                      <CopyIcon size={20} />
                    </Button>
                  </span>
                ) : hasMaxCancellationFee ? (
                  <span>This key is not refundable.</span>
                ) : isRefundable ? (
                  <>
                    <span>
                      {currency}{' '}
                      <PriceFormatter price={refundAmount.toString()} />{' '}
                    </span>
                    {' will be refunded, Do you want to proceed?'}
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
              loading={cancelRefundMutation.isPending}
            >
              {cancelRefundMutation.isPending ? 'Refunding...' : 'Confirm'}
            </Button>
          </div>
        )
      )}
    </Modal>
  )
}
