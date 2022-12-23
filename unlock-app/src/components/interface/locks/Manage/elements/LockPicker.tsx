import React from 'react'
import { useConfig } from '~/utils/withConfig'

interface LockImageProps {
  lockAddress: string
}

export const LockImage = ({ lockAddress }: LockImageProps) => {
  const config = useConfig()
  const lockImage = `${config.services.storage.host}/lock/${lockAddress}/icon`

  return (
    <div className="flex items-center justify-center overflow-hidden bg-gray-200 rounded-full w-7 h-7">
      <img
        src={lockImage}
        alt={lockAddress}
        className="object-cover w-full h-full bg-center"
      />
    </div>
  )
}
