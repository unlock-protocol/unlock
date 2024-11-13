import { Button, Modal } from '@unlock-protocol/ui'
import Link from 'next/link'

export const MigrationModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} size="small">
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
