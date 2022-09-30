import { Button, Modal } from '@unlock-protocol/ui'
import SvgComponents from './svg'

interface Props {
  isOpen: boolean
  setIsOpen: (option: boolean) => void
}

export function DownloadWallet({ isOpen, setIsOpen }: Props) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="p-6 space-y-6 rounded">
        <p>No browser wallet detected. </p>
        <Button
          as="a"
          target="_blank"
          rel="noopener noreferrer"
          iconRight={<SvgComponents.Metamask width={24} />}
        >
          Download metamask
        </Button>
      </div>
    </Modal>
  )
}
