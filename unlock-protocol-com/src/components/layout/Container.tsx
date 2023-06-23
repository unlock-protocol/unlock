import React, { InputHTMLAttributes } from 'react'

type ContainerProps = InputHTMLAttributes<HTMLDivElement>

export default function Container({
  children,
  className = '',
  ...restProps
}: ContainerProps) {
  return (
    <div
      className={`${className} px-6 sm:pt-12 max-w-7xl mx-auto`}
      {...restProps}
    >
      {children}
    </div>
  )
}
