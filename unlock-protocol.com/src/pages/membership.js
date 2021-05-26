import React, { useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { GlobalWrapper } from '../components/interface/GlobalWrapper'
import { MembershipContext } from '../membershipContext'

const MembershipLoader = () => {
  const { becomeMember, isMember } = useContext(MembershipContext)
  const router = useRouter()

  useEffect(() => {
    if (isMember === 'yes') {
      setInterval(() => {
        const iframe = document.querySelector('iframe.unlock-protocol-checkout')
        if (!iframe.classList.contains('show')) {
          window.location =
            router.query.redirect || 'https://unlock-protocol.com'
        }
      }, 200)
    } else {
      becomeMember()
    }
  }, [becomeMember, isMember])

  return <p />
}

const Membership = () => {
  return (
    <GlobalWrapper>
      <MembershipLoader />
    </GlobalWrapper>
  )
}

Membership.getInitialProps = async () => {
  return {}
}

export default Membership
