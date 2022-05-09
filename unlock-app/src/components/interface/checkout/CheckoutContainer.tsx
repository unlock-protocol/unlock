import React from 'react'

interface Props {
  children: React.ReactNode
}

export const CheckoutContainer: React.FunctionComponent<Props> = ({
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <div className="min-h-screen min-w-full flex flex-col items-center justify-center overflow-auto bg-black bg-opacity-25">
      {children}
    </div>
  )
}

export default CheckoutContainer
