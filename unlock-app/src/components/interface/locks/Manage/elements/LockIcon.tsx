import React, { Fragment, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { Button, Input } from '@unlock-protocol/ui'
import { Transition, Dialog, Tab } from '@headlessui/react'
import useAccount from '~/hooks/useAccount'
import { useAuth } from '~/contexts/AuthenticationContext'
import { MdOutlineClose as CloseIcon } from 'react-icons/md'

interface LockIconProps {
  lockAddress: string
  network: number
  loading?: boolean
}

const LockIconPlaceholder = () => {
  return <div className="w-full animate-pulse bg-slate-200 h-80"></div>
}

export const LockIcon = ({ lockAddress, loading }: LockIconProps) => {
  const config = useConfig()
  const imageSrc = lockAddress
    ? `${config.services.storage.host}/lock/${lockAddress}/icon`
    : '/images/svg/default-lock-logo.svg'

  if (loading) return <LockIconPlaceholder />
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-white shadow-lg aspect-1 group rounded-xl">
      <img
        src={imageSrc!}
        alt="Lock image"
        className="object-cover w-full h-full"
      />
    </div>
  )
}
