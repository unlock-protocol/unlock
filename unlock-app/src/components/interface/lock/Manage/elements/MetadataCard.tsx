import { Button, Badge } from '@unlock-protocol/ui'
import { useState } from 'react'
import {
  FaCheckCircle as CheckIcon,
  FaSpinner as Spinner,
} from 'react-icons/fa'
import { useMutation } from 'react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'

interface DetailProps {
  title: string
  value: React.ReactNode
}

interface MetadataCardProps {
  metadata: any
  owner: string
  network: number
}

const keysToIgnore = [
  'token',
  'lockName',
  'expiration',
  'keyholderAddress',
  'lockAddress',
  'checkedInAt',
]

const MetadataDetail = ({ title, value }: DetailProps) => {
  return (
    <div className="pb-2 border-b border-gray-400 last-of-type:border-none">
      <span className="text-base">{`${title}: `}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  )
}

export const MetadataCard = ({
  metadata,
  owner,
  network,
}: MetadataCardProps) => {
  const { account } = useAuth()
  const storageService = useStorageService()
  const walletService = useWalletService()
  const [data, setData] = useState(metadata)
  const [checkInTimestamp, setCheckedInTimestamp] = useState<string | null>(
    null
  )
  const items = Object.entries(metadata || {}).filter(([key]) => {
    return !keysToIgnore.includes(key)
  })

  const { lockAddress, token: tokenId } = data ?? {}

  const getCheckInTime = () => {
    const [_, checkInTimeValue] =
      Object.entries(metadata)?.find(([key]) => key === 'checkedInAt') ?? []
    if (checkInTimestamp) return checkInTimestamp
    if (!checkInTimeValue) return null
    return new Date(checkInTimeValue as number).toLocaleString()
  }

  const sendEmail = async () => {
    return storageService.sendKeyQrCodeViaEmail({
      lockAddress,
      network,
      tokenId,
    })
  }

  const sendEmailMutation = useMutation(sendEmail)

  const onSendQrCode = async () => {
    if (!network) return
    if (!storageService) return
    if (!walletService) return

    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })

    ToastHelper.promise(sendEmailMutation.mutateAsync(), {
      success: 'QR-code sent by email',
      loading: 'Sending QR-code by email',
      error: 'There is some unexpected issue, please try again',
    })
  }

  const isCheckedIn = typeof getCheckInTime() === 'string' || !!checkInTimestamp
  const hasEmail = items.map(([key]) => key.toLowerCase()).includes('email')

  const onMarkAsCheckIn = async () => {
    if (!storageService) return
    const { lockAddress, token: keyId } = data
    return storageService.markTicketAsCheckedIn({
      lockAddress,
      keyId,
      network: network!,
    })
  }

  const markAsCheckInMutation = useMutation(onMarkAsCheckIn, {
    onSuccess: (response: any) => {
      if (!response.ok && response.status === 409) {
        ToastHelper.error('Ticket already checked in')
      }

      if (response.ok) {
        setCheckedInTimestamp(new Date().toLocaleString())
        ToastHelper.success('Successfully marked ticket as checked-in')
      }
    },
    onError: () => {
      ToastHelper.error('Error on marking ticket as checked-in')
    },
  })

  return (
    <>
      <div className="flex gap-3">
        {!isCheckedIn && (
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => markAsCheckInMutation.mutate()}
            disabled={markAsCheckInMutation.isLoading}
          >
            <div className="flex">
              {markAsCheckInMutation.isLoading && (
                <Spinner className="mr-1 animate-spin" />
              )}
              <span>Mark as Checked-in</span>
            </div>
          </Button>
        )}
        {hasEmail ? (
          <>
            <Button
              size="small"
              variant="outlined-primary"
              onClick={onSendQrCode}
              disabled={
                sendEmailMutation.isLoading || sendEmailMutation.isSuccess
              }
            >
              Send QR-code by email
            </Button>
            <Button size="small" variant="outlined-primary">
              Edit email
            </Button>
          </>
        ) : (
          <Button variant="outlined-primary" size="small">
            Add email
          </Button>
        )}
      </div>
      <div className="mt-8">
        <span className="text-base">Metadata</span>

        <div className="mt-6">
          {isCheckedIn && (
            <Badge
              size="tiny"
              variant="green"
              iconRight={<CheckIcon size={11} />}
              className="mb-4"
            >
              <span className="text-sm font-semibold">Checked-in</span>
            </Badge>
          )}
          <div className="flex flex-col gap-4">
            {isCheckedIn && (
              <MetadataDetail title="Checked-in at" value={getCheckInTime()!} />
            )}
            {items?.map(([key, value], index) => {
              return (
                <MetadataDetail
                  key={`${key}-${index}`}
                  title={`${key}`}
                  value={value}
                />
              )
            })}
            <MetadataDetail title="Key Holder" value={owner} />
          </div>
        </div>
      </div>
    </>
  )
}
