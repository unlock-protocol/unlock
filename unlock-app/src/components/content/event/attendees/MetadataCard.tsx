import { Badge, Button, Detail } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useMarkAsCheckInMutation } from '~/hooks/useMarkAsCheckImMutation'
import { getCheckInTime } from '~/utils/getCheckInTime'
import { locksmith } from '~/config/locksmith'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'
import { useMutation } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { UpdateEmailModal } from './UpdateEmailModal'
import { FieldValues } from 'react-hook-form'

interface MetadataCardProps {
  metadata: Record<string, any>
  network: number
  data: { lockAddress: string; token: string }
  lockSettings?: Record<string, any>
}

const MetadataCard: React.FC<MetadataCardProps> = ({
  metadata,
  network,
  data,
}) => {
  const [checkInTimestamp, setCheckedInTimestamp] = useState<string | null>(
    null
  )
  const [addEmailModalOpen, setAddEmailModalOpen] = useState(false)
  const [cardData, setCardData] = useState(metadata)

  const isCheckedIn =
    typeof getCheckInTime(checkInTimestamp, cardData) === 'string' ||
    !!checkInTimestamp

  const hasEmail = Object.entries(cardData || {})
    .map(([key]) => key.toLowerCase())
    .includes('email')

  const markAsCheckInMutation = useMarkAsCheckInMutation({
    network,
    data,
    setCheckedInTimestamp,
  })

  const onSendQrCode = async () => {
    if (!network) return
    ToastHelper.promise(sendEmailMutation.mutateAsync(), {
      success: 'Email sent',
      loading: 'Sending email...',
      error: 'We could not send email.',
    })
  }

  const sendEmail = async () => {
    return locksmith.emailTicket(
      network,
      cardData?.lockAddress,
      cardData?.token
    )
  }

  const sendEmailMutation = useMutation({
    mutationFn: sendEmail,
  })

  const onEmailChange = (values: FieldValues) => {
    setCardData((prevData) => ({
      ...prevData,
      ...values,
    }))
  }

  const formatLabel = (key: string) => {
    if (key === 'fullname') {
      return 'Full name'
    }
    return key
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, (str) => str.toUpperCase())
  }

  return (
    <>
      <UpdateEmailModal
        isOpen={addEmailModalOpen}
        setIsOpen={setAddEmailModalOpen}
        isLockManager={true}
        userAddress={metadata?.keyholderAddress}
        lockAddress={metadata?.lockAddress}
        network={network}
        hasEmail={hasEmail}
        onEmailChange={onEmailChange}
      />
      <div>
        {!isCheckedIn && (
          <Button
            variant="outlined-primary"
            size="small"
            onClick={() => markAsCheckInMutation.mutate()}
            disabled={markAsCheckInMutation.isPending}
            loading={markAsCheckInMutation.isPending}
          >
            Mark as checked-in
          </Button>
        )}
        <div className="pt-6">
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

          <div className="flex flex-col divide-y divide-gray-400">
            {isCheckedIn && (
              <Detail
                className="py-2"
                inline
                justify={false}
                label="Checked-in at:"
              >
                {getCheckInTime(checkInTimestamp, metadata)}
              </Detail>
            )}

            <Detail
              className="py-2"
              label={
                <div className="flex flex-row w-full gap-2 items-center">
                  <span>Email:</span>
                  {hasEmail ? (
                    <div className="flex flex-row w-full gap-3 items-center">
                      <span className="text-base font-semibold text-black">
                        {metadata?.email}
                      </span>
                      <Button
                        size="tiny"
                        variant="outlined-primary"
                        onClick={() => setAddEmailModalOpen(true)}
                      >
                        Edit email
                      </Button>

                      <Button
                        size="tiny"
                        variant="outlined-primary"
                        onClick={onSendQrCode}
                        disabled={
                          sendEmailMutation.isPending ||
                          sendEmailMutation.isSuccess
                        }
                      >
                        {sendEmailMutation.isSuccess
                          ? 'Email sent'
                          : 'Send QR-code by email'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outlined-primary"
                      size="tiny"
                      onClick={() => setAddEmailModalOpen(true)}
                    >
                      Add email
                    </Button>
                  )}
                </div>
              }
            />

            {['fullname', 'lockName'].map((key, index) => {
              const value = metadata[key]
              return (
                <Detail
                  className="py-2"
                  key={`${key}-${index}`}
                  label={`${formatLabel(key)}: `}
                  inline
                  justify={false}
                >
                  {value || null}
                </Detail>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default MetadataCard
