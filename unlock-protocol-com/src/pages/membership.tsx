import type { NextPage } from 'next'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'
import { Membership } from '../components/pages/Membership'

const MembershipPage: NextPage = () => {
  return (
    <GlobalWrapper>
      <Membership />
    </GlobalWrapper>
  )
}

export default MembershipPage
