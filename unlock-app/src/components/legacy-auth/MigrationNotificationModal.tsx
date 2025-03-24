import { usePrivy } from '@privy-io/react-auth'
import { Button, Modal } from '@unlock-protocol/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const MigrationModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) => {
  const pathname = usePathname()
  const { logout } = usePrivy()
  const isCheckoutPage = pathname?.includes('checkout')
  const isMigrationPage = pathname?.includes('migrate-user')
  // don't show the modal on the checkout or migration page
  if (isCheckoutPage || isMigrationPage) return null

  // no-op function to prevent modal from closing, even by entering the escape key
  const preventClose = () => {}

  const handleSignOut = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={preventClose} size="small" hideCloseIcon>
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-bold">Legacy Account Detected</h2>
        <p>
          We&apos;ve detected that you have an existing Unlock account that
          needs to be migrated. Please complete the migration process to
          continue.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <Link href="/migrate-user">
            <Button>Start Migration</Button>
          </Link>
          <p
            className="text-sm underline text-brand-ui-primary cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </p>
        </div>
      </div>
    </Modal>
  )
}
