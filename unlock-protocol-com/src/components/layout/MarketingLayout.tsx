import { ReactNode } from 'react'
import Footer from '../interface/Footer'
import { Navigation } from '../interface/Navigation'
import { CenteredColumn } from './Columns'

interface Props {
  children?: ReactNode
}

export function MarketingLayout({ children }: Props) {
  return (
    <>
      <Navigation />
      <div className="px-6 py-24 pb-12">
        <CenteredColumn>
          <main>{children}</main>
        </CenteredColumn>
      </div>
      <Footer />
    </>
  )
}
