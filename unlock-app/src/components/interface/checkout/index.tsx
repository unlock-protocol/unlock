'use client'
import { CheckoutContainer } from './CheckoutContainer'
import { useEffect } from 'react'

export function CheckoutPage() {
  useEffect(() => {
    document.querySelector('body')?.classList.add('bg-transparent')
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-w-full min-h-screen p-3 overflow-auto bg-gray-300 bg-opacity-75 backdrop-filter backdrop-blur-sm">
      <CheckoutContainer />
    </div>
  )
}
