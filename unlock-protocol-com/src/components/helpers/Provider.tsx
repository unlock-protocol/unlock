import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function Provider({ children }: Props) {
  return <>{children} </>
}
