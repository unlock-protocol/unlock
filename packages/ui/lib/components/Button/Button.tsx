import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
}

export function Button({ children }: ButtonProps) {
  return (
    <button className="px-4 py-2 font-bold border rounded bg-gray-50">
      {children}
    </button>
  )
}
