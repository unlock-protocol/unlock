import React, { useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'
import { MembershipContext } from '../membershipContext'

const MembershipLoader = () => {
  const { becomeMember, isMember } = useContext(MembershipContext)
  const router = useRouter()

  useEffect(() => {
    if (isMember) {
      window.location = router.query.redirect || 'https://unlock-protocol.com'
    } else {
      becomeMember()
    }
  }, [becomeMember, isMember])

  return <p />
}

const Members = () => {
  return (
    <GlobalWrapper>
      <MembershipLoader />
    </GlobalWrapper>
  )
}

Members.getInitialProps = async () => {
  return {}
}

export default Members
