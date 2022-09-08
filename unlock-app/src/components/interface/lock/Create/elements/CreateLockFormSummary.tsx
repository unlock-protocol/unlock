import { useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { LockFormProps } from '../useCreateLock'

const StatusLabel = ({
  active = false,
  label,
  description,
}: {
  active: boolean
  label: string
  description?: string
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

export const CreateLockFormSummary: React.FC<CreateLockFormSummaryProps> = ({
  lock,
  network,
}) => {
  const { networks } = useConfig()
  const { unlimitedDuration = false, unlimitedQuantity = false } = lock ?? {}
  const networkName = networks[network!]?.name
  const [isDeploying, setIsDeploying] = useState(false)

  return (
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
  )
}
