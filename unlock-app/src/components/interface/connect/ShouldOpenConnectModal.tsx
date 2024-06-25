import { useRouter } from 'next/router'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'

const ShouldOpenConnectModal = () => {
  const router = useRouter()

  const { account, connected } = useAuth()

  const { openConnectModal } = useConnectModal()

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

  return <></>
}

export default ShouldOpenConnectModal
