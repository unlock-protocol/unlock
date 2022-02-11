import { ReactNode } from 'react'
import Footer from '../interface/Footer'
import { Navigation } from '../interface/Navigation'

interface Props {
  children?: ReactNode
}

export function Layout({ children }: Props) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  )
}
