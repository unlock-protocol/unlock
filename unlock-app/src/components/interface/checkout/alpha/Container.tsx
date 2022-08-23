import React, { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function Container({ children }: Props) {
  return (
    <div className="min-h-screen min-w-full p-3 flex flex-col backdrop-filter backdrop-blur-sm bg-zinc-500 bg-opacity-25 items-center justify-center overflow-auto">
      {children}
    </div>
  )
}
