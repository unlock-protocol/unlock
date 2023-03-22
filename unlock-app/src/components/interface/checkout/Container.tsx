import React, { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function Container({ children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-w-full min-h-screen p-3 overflow-auto bg-gray-300 bg-opacity-75 backdrop-filter backdrop-blur-sm">
      {children}
    </div>
  )
}
