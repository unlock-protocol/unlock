import { Button, Modal } from '@unlock-protocol/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const MigrationModal = ({
  isOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) => {
  const pathname = usePathname()
  const isCheckoutPage = pathname?.includes('checkout')
  const isMigrationPage = pathname?.includes('migrate-user')
  // don't show the modal on the checkout or migration page
  if (isCheckoutPage || isMigrationPage) return null

  // no-op function to prevent modal from closing, even by entering the escape key
  const preventClose = () => {}

  return (
    <Modal isOpen={isOpen} setIsOpen={preventClose} size="small" hideCloseIcon>
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-bold">Legacy Account Detected</h2>
        <p>
          We&apos;ve detected that you have an existing Unlock account that
          needs to be migrated. Please complete the migration process to
          continue.
        </p>
        <div className="flex justify-center">
          <Link href="/migrate-user">
            <Button>Start Migration</Button>
          </Link>
        </div>
      </div>
    </Modal>
  )
}
