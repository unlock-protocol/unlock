import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function Container({ children }: Props) {
  return (
    <div className="relative bg-opacity-25 p-6 bg-black h-screen w-full flex flex-col justify-center items-center">
      {children}
    </div>
  )
}
