import { Button, Detail } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { ExpireAndRefundModal } from '~/components/interface/ExpireAndRefundModal'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata } from '@unlock-protocol/core'

interface AttendeeInfoProps {
  network: number
  lockAddress: string
  owner: string
  token: string
  metadata: Metadata
}

export const AttendeeInfo = ({
  network,
  lockAddress,
  owner,
  token,
  metadata,
}: AttendeeInfoProps) => {
  const [expireAndRefundOpen, setExpireAndRefundOpen] = useState(false)

  const addressToEns = useEns(owner)
  const resolvedAddress =
    addressToEns === owner ? addressMinify(owner) : addressToEns
  const addressToCopy = addressToEns === owner ? owner : addressToEns

  const [isCopied, setCopied] = useClipboard(addressToCopy, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success('Address copied')
  }, [isCopied])

  return (
    <>
      <ExpireAndRefundModal
        network={network}
        isOpen={expireAndRefundOpen}
        setIsOpen={setExpireAndRefundOpen}
        lockAddress={lockAddress}
        keyOwner={owner}
        tokenId={token}
      />

      <div className="flex md:flex-row flex-col gap-4 space-between w-full">
        <Detail label="#" valueSize="medium" className="w-8">
          {token}
        </Detail>

        {metadata.fullname && (
          <Detail
            label="Full Name"
            valueSize="medium"
            className="w-full overflow-auto min-w-24"
          >
            {metadata.fullname}
          </Detail>
        )}

        {metadata.email && (
          <Detail
            label="Email"
            valueSize="medium"
            className="w-full overflow-auto min-w-24"
          >
            {metadata.email}
          </Detail>
        )}

        <Detail
          label="Wallet"
          valueSize="medium"
          className="w-full overflow-auto min-w-24"
        >
          <div className="flex self-start gap-2">
            <div>{resolvedAddress}</div>
            <div className="mt-auto">
              <Button
                variant="borderless"
                onClick={setCopied}
                aria-label="copy"
              >
                <CopyIcon size={20} />
              </Button>
            </div>
          </div>
        </Detail>

        {/* {isManager && (
          <div className="w-full col-span-3 gap-3 mx-auto md:mx-0 md:ml-auto md:col-span-2 md:w-auto">
            {!refundDisabled && (
              <Button
                size="small"
                variant="outlined-primary"
                disabled={refundDisabled}
                aria-label="refund"
                onClick={() => {
                  if (refundDisabled) return
                  setExpireAndRefundOpen(true)
                }}
              >
                Cancel
              </Button>
            )}  */}
      </div>
    </>
  )
}
