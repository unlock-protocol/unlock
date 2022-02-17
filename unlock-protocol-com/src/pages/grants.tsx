import type { NextPage } from 'next'
import { Grants } from '../components/pages/Grants'
import { MarketingLayout } from '../components/layout/MarketingLayout'

const GrantsPage: NextPage = () => {
  return (
    <MarketingLayout>
      <Grants />
    </MarketingLayout>
  )
}

export default GrantsPage
