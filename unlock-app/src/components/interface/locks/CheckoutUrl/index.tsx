import { useState } from 'react'
import { PaywallConfig } from '~/unlockTypes'
import { CheckoutForm } from './elements/CheckoutForm'
import { CheckoutPreview } from './elements/CheckoutPreview'

const Header = () => {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Checkout Builder</h1>
      <span className="text-base text-gray-700">
        Easily customize your checkout experience right here.
      </span>
    </header>
  )
}

export const CheckoutUrlPage = () => {
  const [paywallConfig, setPaywallConfig] = useState<PaywallConfig>({
    locks: {},
    metadataInputs: [{ name: 'test', type: 'text', required: false }],
  })

  const onAddLocks = (locks: any) => {
    setPaywallConfig({
      ...paywallConfig,
      locks,
    })
  }

  const onBasicConfigChange = (fields: Partial<PaywallConfig>) => {
    setPaywallConfig({
      ...paywallConfig,
      ...fields,
    })
  }

  return (
    <div className="flex flex-col w-full h-screen gap-8 pt-10 pb-20 md:flex-row">
      <div className="md:w-1/2">
        <CheckoutPreview paywallConfig={paywallConfig} />
      </div>
      <div className="flex flex-col gap-4 md:w-1/2">
        <Header />
        <CheckoutForm
          onAddLocks={onAddLocks}
          onBasicConfigChange={onBasicConfigChange}
          paywallConfig={paywallConfig}
        />
      </div>
    </div>
  )
}
