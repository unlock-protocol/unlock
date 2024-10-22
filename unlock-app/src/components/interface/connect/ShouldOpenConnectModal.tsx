'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useConnectModal } from '~/hooks/useConnectModal'

const ShouldOpenConnectModal = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { account } = useAuthenticate()
  const { openConnectModal } = useConnectModal()

  useEffect(() => {
    if (searchParams.get('shouldOpenConnectModal') && !account) {
      openConnectModal()

      // Remove the shouldOpenConnectModal from the query string
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('shouldOpenConnectModal')
      const newPathname = `${pathname}?${newSearchParams.toString()}`
      router.replace(newPathname)
    }
  }, [searchParams, pathname, router, account, openConnectModal])

  return null
}

export default ShouldOpenConnectModal
