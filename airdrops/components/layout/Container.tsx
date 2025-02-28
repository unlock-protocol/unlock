import React from 'react'
interface Props {
  children?: React.ReactNode
}

export const Container = ({ children }: Props) => {
  return <div className="mx-auto lg:px-4 lg:container">{children}</div>
}
