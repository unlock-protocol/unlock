import { Button, Modal } from '@unlock-protocol/ui'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export const PromptSignOut = () => {
  const { signOut } = useAuthenticate()

  return (
    <Modal isOpen={true} setIsOpen={() => null} hideCloseIcon>
      <div className="w-full bg-white rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Sign Out Required</h2>
        <p className="mb-6">
          You need to sign out of your current account before proceeding with
          the migration process.
        </p>
        <div className="flex justify-end">
          <Button onClick={signOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    </Modal>
  )
}
