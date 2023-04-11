import { Tooltip } from '@unlock-protocol/ui'
import { toFormData } from 'axios'
import Link from 'next/link'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { IoLogoLinkedin as LinkedinIcon } from 'react-icons/io'

interface LinkedinShareProps {
  metadata: Partial<Metadata>
  lockAddress: string
  network: number
  tokenId: string
}

export const LinkedinShareButton = ({
  metadata,
  lockAddress,
  network,
  tokenId,
}: LinkedinShareProps) => {
  const certificateData = toFormData(metadata)

  if (!metadata.name || !certificateData) {
    return null
  }
  const certificationUrl = `${window?.location?.origin}/certification?lockAddress=${lockAddress}&network=${network}&tokenId=${tokenId}`

  const linkedinIntent = new URL('https://www.linkedin.com/shareArticle')
  linkedinIntent.searchParams.set('mini', 'true')
  linkedinIntent.searchParams.set('url', certificationUrl)

  return (
    <Tooltip
      delay={0}
      label="Share on LinkedIn"
      tip="Share on LinkedIn"
      side="bottom"
    >
      <Link
        target="_blank"
        href={linkedinIntent.toString()}
        className="flex items-center justify-center"
      >
        <LinkedinIcon
          className="text-gray-900 opacity-50 cursor-pointer hover:opacity-100"
          size={30}
        />
      </Link>
    </Tooltip>
  )
}

export default LinkedinShareButton
