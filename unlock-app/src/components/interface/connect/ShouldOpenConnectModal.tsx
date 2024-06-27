import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'

const ShouldOpenConnectModal = () => {
  const router = useRouter()

  const { account, connected } = useAuth()

  const { openConnectModal } = useConnectModal()

  // This should be executed only if router is defined
  useEffect(() => {
    if (router.query.shouldOpenConnectModal && !connected && !account) {
      openConnectModal()

      // Remove the shouldOpenConnectModal from the query string
      const { shouldOpenConnectModal, ...otherQueryParams } = router.query
      router.replace(
        {
          pathname: router.pathname,
          query: otherQueryParams,
        },
        undefined,
        { shallow: true }
      )
    }
  }, [router, connected, account, openConnectModal])

  return <></>
}

export default ShouldOpenConnectModal
