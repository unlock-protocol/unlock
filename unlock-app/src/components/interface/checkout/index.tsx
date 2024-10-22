'use client'
import { AsyncSendable } from '~/hooks/useCheckoutCommunication'
import { CheckoutContainer, ProviderAdpaterContext } from './CheckoutContainer'
import { useEffect, useState } from 'react'

export function CheckoutPage() {
  const [providerAdapter, setProviderAdapter] = useState<AsyncSendable | null>(
    null
  )
  useEffect(() => {
    document.querySelector('body')?.classList.add('bg-transparent')
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-w-full min-h-screen p-3 overflow-auto bg-gray-300 bg-opacity-75 backdrop-filter backdrop-blur-sm">
      <ProviderAdpaterContext.Provider
        value={{
          providerAdapter,
          setProviderAdapter: (provider: AsyncSendable) => {
            console.log('Setting providerAdapter as expected!')
            setProviderAdapter(provider)
          },
        }}
      >
        <CheckoutContainer />
      </ProviderAdpaterContext.Provider>
    </div>
  )
}
