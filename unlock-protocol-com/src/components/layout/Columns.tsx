import { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function CenteredColumn({ children }: Props) {
  return <div className="max-w-screen-lg mx-auto ">{children}</div>
}
