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

  const onChange = (schema: string, fields: any) => {
    setPaywallConfig({
      ...paywallConfig,
      ...fields,
    })
  }

  const onAddLocks = (locks: any) => {
    setPaywallConfig({
      ...paywallConfig,
      locks,
    })
    console.log(locks)
  }

  const onBasicConfigChange = (fields: Partial<PaywallConfig>) => {
    setPaywallConfig({
      ...paywallConfig,
      ...fields,
    })
  }

  return (
    <div className="flex flex-col w-full gap-8 pb-20 md:flex-row">
      <div className="w-1/2">
        <CheckoutPreview paywallConfig={paywallConfig} />
      </div>
      <div className="flex flex-col w-1/2 gap-4">
        <Header />
        <CheckoutForm
          onChange={onChange}
          onAddLocks={onAddLocks}
          onBasicConfigChange={onBasicConfigChange}
          paywallConfig={paywallConfig}
        />
      </div>
    </div>
  )
}
