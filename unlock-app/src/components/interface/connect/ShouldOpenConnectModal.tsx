'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'

const ShouldOpenConnectModal = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const { account, connected } = useAuth()

  const { openConnectModal } = useConnectModal()

  useEffect(() => {
    if (searchParams.get('shouldOpenConnectModal') && !connected && !account) {
      openConnectModal()

      // Remove the shouldOpenConnectModal from the query string
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('shouldOpenConnectModal')
      const newPathname = `${pathname}?${newSearchParams.toString()}`
      router.replace(newPathname)
    }
  }, [searchParams, pathname, router, connected, account, openConnectModal])

  return null
}

export default ShouldOpenConnectModal
