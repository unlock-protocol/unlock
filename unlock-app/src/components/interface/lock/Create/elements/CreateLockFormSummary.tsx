import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { LockFormProps } from './CreateLockForm'

interface StatusProps {
  active: boolean
  label: string
  description?: string
}

interface DeployStatusProps {
  label: string
  description: string
}

const StatusLabel: React.FC<StatusProps> = ({
  active = false,
  label,
  description,
}) => {
  return (
    <div className={active ? 'text-black' : 'text-gray-300'}>
      <span className="block text-4xl font-bold">{label}</span>
      {description && <span className="mt-2 text-base">{description}</span>}
    </div>
  )
}

interface CreateLockFormSummaryProps {
  lock: LockFormProps
  network: number
}

const DEPLOY_STATUS_MAPPING: Record<string, DeployStatusProps> = {
  progress: {
    label: 'This will take few minutes...',
    description: 'Feel free to wait in this screen or return to main page.',
  },
  deployed: {
    label: '🚀​ Lock is successfully deployed',
    description: 'Redirecting you back to main page...',
  },
}

export const CreateLockFormSummary: React.FC<CreateLockFormSummaryProps> = ({
  lock,
  network,
}) => {
  const { networks } = useConfig()
  const { unlimitedDuration = false, unlimitedQuantity = false } = lock ?? {}
  const networkName = networks[network!]?.name
  const [isDeploying, setIsDeploying] = useState(true)

  const status = isDeploying
    ? DEPLOY_STATUS_MAPPING.progress
    : DEPLOY_STATUS_MAPPING.deployed

  return (
    <div>
      <div className="grid grid-cols-2 border border-gray-400 divide-x divide-gray-400 rounded-xl">
        <div data-testid="summary" className="flex flex-col gap-8 px-8 py-10">
          <div className="flex flex-col gap-2">
            <span className="text-base">Network</span>
            <span className="text-xl font-bold">{networkName}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Name</span>
            <span className="text-xl font-bold">{lock?.name}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Duration</span>
            <span className="text-xl font-bold">
              {unlimitedDuration ? 'Unlimited' : lock?.duration}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Quantity</span>
            <span className="text-xl font-bold">
              {unlimitedQuantity ? 'Unlimited' : lock?.quantity}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Currency & Price</span>
            <span className="text-xl font-bold">{lock?.price}</span>
          </div>
        </div>
        {isDeploying && (
          <div data-testid="status" className="flex flex-col gap-8 px-8 py-10 ">
            <StatusLabel
              label="Deploying..."
              description="Block 1/20 confirmed."
              active={true}
            />
            <StatusLabel label="Deployed." active={false} />
            <StatusLabel label="Confirming..." active={false} />
            <StatusLabel label="Confirmed." active={false} />
          </div>
        )}
      </div>
      {isDeploying && (
        <div className="flex flex-col items-center mt-12">
          <h3 className="block mb-4 text-4xl font-bold">{status.label}</h3>
          <span className="mb-4 font-base">{status.description}</span>
          <Button className="w-full max-w-lg" variant="outlined-primary">
            Return to main
          </Button>
        </div>
      )}
    </div>
  )
}
