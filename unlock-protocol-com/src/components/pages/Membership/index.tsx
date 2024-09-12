import React, { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMembership } from '../../../hooks/useMembership'

export function Membership() {
  const { becomeMember, isMember } = useMembership()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = () => {
      const location = searchParams.get('redirect') ?? '/'
      location.startsWith('/') && location.startsWith('#')
        ? router.push(location)
        : window.location.assign(location)
    }
    window.addEventListener('unlockProtocol.closeModal', redirect)
    return () =>
      window.removeEventListener('unlockProtocol.closeModal', redirect)
  }, [router, searchParams])

  useEffect(() => {
    if (isMember === 'yes') {
      const timer = setInterval(() => {
        const iframe = document.querySelector('iframe.unlock-protocol-checkout')
        if (!iframe?.classList?.contains('show')) {
          const location =
            searchParams.get('redirect') ?? 'https://unlock-protocol.com'
          window.location.assign(location)
        }
      }, 300)

      return () => clearInterval(timer)
    } else {
      return () => becomeMember()
    }
  }, [becomeMember, isMember, searchParams])

  return <p />
}
