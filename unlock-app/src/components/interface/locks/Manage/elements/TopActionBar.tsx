'use client'

import { Button, Icon } from '@unlock-protocol/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLockManager } from '~/hooks/useLockManager'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { TbSettings as SettingsIcon } from 'react-icons/tb'
import ToolsMenu from './ToolsMenu'

interface TopActionBarProps {
  lockAddress: string
  network: number
}

export const TopActionBar = ({ lockAddress, network }: TopActionBarProps) => {
  const router = useRouter()

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="borderless" aria-label="arrow back">
          <Link href="/locks">
            <ArrowBackIcon size={20} className="cursor-pointer" />
          </Link>
        </Button>
        <div className="flex gap-3">
          {isManager && (
            <Button
              onClick={() => {
                router.push(
                  `/locks/settings?address=${lockAddress}&network=${network}`
                )
              }}
            >
              <div className="flex items-center gap-2">
                <Icon icon={SettingsIcon} size={20} />
                <span>Settings</span>
              </div>
            </Button>
          )}

          <ToolsMenu lockAddress={lockAddress} network={network} />
        </div>
      </div>
    </>
  )
}

export default TopActionBar
