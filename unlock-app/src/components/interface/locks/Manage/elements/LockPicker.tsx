import networks from '@unlock-protocol/networks'
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addressMinify } from '~/utils/strings'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Select } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useConfig } from '~/utils/withConfig'
import { useAuth } from '~/contexts/AuthenticationContext'

interface LockPickerProps {
  owner: string
  onChange: (
    lockAddress?: string,
    network?: number | string,
    name?: string
  ) => void
  defaultValues?: Record<string, any>
}

interface LockImageProps {
  lockAddress: string
}

const SelectPlaceholder = () => {
  return (
    <span className="w-full h-8 rounded-lg animate-pulse bg-slate-200"></span>
  )
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
