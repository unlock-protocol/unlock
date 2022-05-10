import React, { useEffect } from 'react'

interface Props {
  children: React.ReactNode
}

export const CheckoutContainer: React.FunctionComponent<Props> = ({
  children,
}: React.PropsWithChildren<Props>) => {
  useEffect(() => {
    // We use background color on body on normal pages. This adds a class to override it.
    document.querySelector('body')?.classList.add('bg-transparent')
  }, [])

  return (
    <div className="min-h-screen min-w-full flex flex-col bg-opacity-25 bg-black items-center justify-center overflow-auto">
      {children}
    </div>
  )
}

export default CheckoutContainer
