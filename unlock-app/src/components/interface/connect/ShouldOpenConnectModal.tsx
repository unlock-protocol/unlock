import { useRouter } from 'next/router'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'

const ShouldOpenConnectModal = () => {
  const router = useRouter()
  const restoredState = JSON.parse(
    decodeURIComponent((router.query.state as string) || '{}')
  )

  const { account, connected } = useAuth()

  const { openConnectModal } = useConnectModal()

  if (restoredState.shouldOpenConnectModal && !connected && !account) {
    openConnectModal()

    // Remove the shouldOpenConnectModal from the query string
    const { shouldOpenConnectModal, ...otherStateParams } = restoredState
    const updatedState = encodeURIComponent(JSON.stringify(otherStateParams))
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, state: updatedState },
      },
      undefined,
      { shallow: true }
    )
  }

  return <></>
}

export default ShouldOpenConnectModal
