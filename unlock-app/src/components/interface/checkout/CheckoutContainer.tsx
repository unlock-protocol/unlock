import React from 'react'
import styled from 'styled-components'
import Media from '../../../theme/media'

interface Props {
  children: React.ReactNode
}

export const CheckoutContainer: React.FunctionComponent<Props> = ({
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-black bg-opacity-25">
      {children}
    </div>
  )
}

export default CheckoutContainer
