import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useMembership } from '../../../hooks/useMembership'

export function Membership() {
  const { becomeMember, isMember } = useMembership()
  const router = useRouter()

  useEffect(() => {
    const redirect = () => {
      const location = router.query.redirect?.toString() ?? '/'
      location.startsWith('/') && location.startsWith('#')
        ? router.push(location)
        : window.location.assign(location)
    }
    window.addEventListener('unlockProtocol.closeModal', redirect)
    return () =>
      window.removeEventListener('unlockProtocol.closeModal', redirect)
  }, [router])

  useEffect(() => {
    if (isMember === 'yes') {
      const timer = setInterval(() => {
        const iframe = document.querySelector('iframe.unlock-protocol-checkout')
        if (!iframe?.classList?.contains('show')) {
          const location =
            router.query.redirect?.toString() ?? 'https://unlock-protocol.com'
          window.location.assign(location)
        }
      }, 300)

      return () => clearInterval(timer)
    } else {
      return () => becomeMember()
    }
  }, [becomeMember, isMember, router])

  return <p />
}
