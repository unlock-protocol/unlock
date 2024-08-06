import { Badge, Button, Detail } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useMarkAsCheckInMutation } from '~/hooks/useMarkAsCheckImMutation'
import { getCheckInTime } from '~/utils/getCheckInTime'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'

interface MetadataCardProps {
  metadata: Record<string, any>
  network: number
  data: { lockAddress: string; token: string }
}

const MetadataCard: React.FC<MetadataCardProps> = ({
  metadata,
  network,
  data,
}) => {
  const [checkInTimestamp, setCheckedInTimestamp] = useState<string | null>(
    null
  )

  const isCheckedIn =
    typeof getCheckInTime(checkInTimestamp, metadata) === 'string' ||
    !!checkInTimestamp

  const markAsCheckInMutation = useMarkAsCheckInMutation({
    network,
    data,
    setCheckedInTimestamp,
  })

  return (
    <div>
      {!isCheckedIn && (
        <Button
          variant="outlined-primary"
          size="small"
          onClick={() => markAsCheckInMutation.mutate()}
          disabled={markAsCheckInMutation.isLoading}
          loading={markAsCheckInMutation.isLoading}
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
          {Object.entries(metadata || {})
            .filter(([key]) => {
              return ![
                'keyholderAddress',
                'keyManager',
                'lockAddress',
              ].includes(key)
            })
            .map(([key, value]: any, index: number) => {
              return (
                <Detail
                  className="py-2"
                  key={`${key}-${index}`}
                  label={`${key}: `}
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
  )
}

export default MetadataCard
