import { Button, Icon } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { TbSettings as SettingsIcon } from 'react-icons/tb'
import { ToolsMenu } from './ToolsMenu'

interface TopActionBarProps {
  lockAddress: string
  network: number
  isManager: boolean
}

export const TopActionBar = ({
  lockAddress,
  network,
  isManager,
}: TopActionBarProps) => {
  const router = useRouter()

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

          <ToolsMenu
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
          />
        </div>
      </div>
    </>
  )
}
