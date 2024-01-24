import { Button, Detail } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { Metadata } from '@unlock-protocol/core'

interface ApplicantInfoProps {
  network: number
  lockAddress: string
  owner: string
  metadata: Metadata
}

export const ApplicantInfo = ({
  network,
  lockAddress,
  owner,
  metadata,
}: ApplicantInfoProps) => {
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
      <div className="flex md:flex-row flex-col gap-4 space-between w-full">
        <Detail label="Full Name" valueSize="medium" className="grow w-24">
          {metadata.fullname}
        </Detail>

        <Detail label="Email" valueSize="medium" className="grow w-32">
          {metadata.email}
        </Detail>

        <Detail label="Wallet" valueSize="medium" className="grow">
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

        <div className="gap-1 flex flex-col w-auto">
          <Button
            size="small"
            onClick={() => alert('approve!')}
            className="w-full"
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => alert('deny!')}
            className="w-full"
          >
            Deny
          </Button>
        </div>
      </div>
    </>
  )
}
