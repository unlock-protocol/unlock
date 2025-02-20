import React from 'react'
interface Props {
  children?: React.ReactNode
}

export const Container = ({ children }: Props) => {
  return <div className="px-4 mx-auto lg:container">{children}</div>
}
