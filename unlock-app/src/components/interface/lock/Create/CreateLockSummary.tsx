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

interface CreateLockSummaryProps {
  network: string
}

export const CreateLockSummary: React.FC<CreateLockSummaryProps> = ({
  network,
}) => {
  return (
    <div className="grid grid-cols-2 border border-gray-400 divide-x divide-gray-400 rounded-xl">
      <div data-testid="summary" className="flex flex-col gap-8 px-8 py-10">
        <div className="flex flex-col gap-2">
          <span className="text-base">Network</span>
          <span className="text-xl font-bold">{network}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-base">Name</span>
          <span className="text-xl font-bold"></span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-base">Duration</span>
          <span className="text-xl font-bold"></span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-base">Quantity</span>
          <span className="text-xl font-bold"></span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-base">Currency & Price</span>
          <span className="text-xl font-bold"></span>
        </div>
      </div>
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
    </div>
  )
}
