'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button, Modal } from '@unlock-protocol/ui'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export const PromptEmailLink = () => {
  const { user, ready } = usePrivy()
  const pathname = usePathname()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (ready && user) {
      const hasEmail = user.linkedAccounts.some(
        (account) => account.type === 'email'
      )
      setShowModal(!hasEmail && pathname !== '/settings')
    }
  }, [ready, user, pathname])

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
