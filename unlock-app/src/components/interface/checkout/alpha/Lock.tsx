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
    <div className="flex flex-col p-2 w-full gap-4 items-center ring-1 justify-between ring-gray-200 animate-pulse duration-150 rounded-xl cursor-pointer relative">
      <div className="inline-flex items-start w-full justify-between gap-x-4">
        <div>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg h-16 w-16" />
        </div>
        <div className="w-full h-6 bg-gray-50 animate-pulse duration-150 rounded-full" />
      </div>
      <div className="flex w-full justify-start gap-x-2">
        <div className="w-24 h-4 bg-gray-50 animate-pulse duration-150 rounded-full" />
        <div className="w-24 h-4 bg-gray-50 animate-pulse duration-150 rounded-full" />
      </div>
    </div>
  )
}
