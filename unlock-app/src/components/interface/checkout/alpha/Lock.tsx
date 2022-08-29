interface PricingProps {
  isCardEnabled: boolean
  usdPrice?: string
  keyPrice?: string
}

export function Pricing({ usdPrice, keyPrice, isCardEnabled }: PricingProps) {
  if (isCardEnabled && !usdPrice) {
    return (
      <div className="grid text-right">
        <span className="font-semibold">{keyPrice}</span>
      </div>
    )
  }
  if (isCardEnabled) {
    return (
      <div className="grid text-right">
        <span className="font-semibold">{usdPrice}</span>
        <span className="text-sm text-gray-500">{keyPrice} </span>
      </div>
    )
  }
  return (
    <div className="grid text-right">
      <span className="font-semibold">{keyPrice} </span>
      <span className="text-sm text-gray-500">{usdPrice}</span>
    </div>
  )
}

export const LockOptionPlaceholder = () => {
  return (
    <div className="relative flex flex-col items-center justify-between w-full gap-4 p-2 duration-150 border cursor-pointer ring-gray-200 animate-pulse rounded-xl">
      <div className="inline-flex items-start justify-between w-full gap-x-4">
        <div>
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gray-50" />
        </div>
        <div className="w-full h-6 duration-150 rounded-full bg-gray-50 animate-pulse" />
      </div>
      <div className="flex justify-start w-full gap-x-2">
        <div className="w-24 h-4 duration-150 rounded-full bg-gray-50 animate-pulse" />
        <div className="w-24 h-4 duration-150 rounded-full bg-gray-50 animate-pulse" />
      </div>
    </div>
  )
}
