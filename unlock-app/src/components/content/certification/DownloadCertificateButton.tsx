import { Tooltip } from '@unlock-protocol/ui'
import { RiDownloadLine as DownloadIcon } from 'react-icons/ri'

export const DownloadCertificateButton = ({ ...props }: any) => {
  return (
    <Tooltip
      delay={0}
      label="Download certification"
      tip="Download certification"
      side="bottom"
    >
      <DownloadIcon
        className="text-gray-900 opacity-50 cursor-pointer hover:opacity-100"
        size={30}
        {...props}
      />
    </Tooltip>
  )
}
