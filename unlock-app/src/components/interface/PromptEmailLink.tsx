'use client'

import { Button, Modal } from '@unlock-protocol/ui'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { usePrivy } from '@privy-io/react-auth'

export const PromptEmailLink = () => {
  const { authenticated } = usePrivy()
  const { email, privyReady } = useAuthenticate()
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)

  const exemptPaths = useMemo(() => ['/settings', '/checkout'], [])

  useEffect(() => {
    if (privyReady && authenticated) {
      setShowModal(
        (!email || email === undefined || email === null) &&
          !exemptPaths.includes(pathname)
      )
    }
  }, [privyReady, authenticated, email, pathname, exemptPaths])

  return (
    <Modal isOpen={showModal} setIsOpen={() => {}} size="small">
      <div className="z-10 w-full max-w-sm bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Email Required</h2>
        <p className="mb-6">
          To continue using the dashboard, please add your email address.
        </p>
        <Link href="/settings">
          <Button className="w-full">Add Email</Button>
        </Link>
      </div>
    </Modal>
  )
}
