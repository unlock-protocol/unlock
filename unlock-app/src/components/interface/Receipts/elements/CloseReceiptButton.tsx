import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/navigation'
import { IoMdClose as CloseIcon } from 'react-icons/io'
import { useLockManager } from '~/hooks/useLockManager'

interface CloseReceiptButton {
  lockAddress: string
  network: number
}

export const CloseReceiptButton = ({
  lockAddress,
  network,
}: CloseReceiptButton) => {
  const router = useRouter()

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  const closeReceipts = () => {
    if (isManager) {
      router.push(`/locks/lock?address=${lockAddress}&network=${network}`)
    } else {
      router.push('/keychain')
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div className="grid justify-between w-full max-w-lg gap-4 mb-5">
        <Button onClick={closeReceipts} variant="borderless" className="">
          <CloseIcon size={20} />
          <div>{/*Empty placeholder*/}</div>
        </Button>
      </div>
    </div>
  )
}
