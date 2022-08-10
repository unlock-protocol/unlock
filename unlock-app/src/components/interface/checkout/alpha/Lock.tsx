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
