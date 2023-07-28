import { Button } from '@unlock-protocol/ui'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { IoLogoLinkedin as LinkedinIcon } from 'react-icons/io'
import { getCertificationPath } from './utils'

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

  const certificationUrl = `${window?.location?.origin}${getCertificationPath({
    metadata,
    lockAddress,
    network,
    tokenId,
  })}`

  const linkedinIntent = new URL('https://www.linkedin.com/profile/add')
  linkedinIntent.searchParams.set('startTask', 'CERTIFICATION_NAME')
  linkedinIntent.searchParams.set('name', metadata.name)
  linkedinIntent.searchParams.set(
    'organizationName',
    certificateData?.certification?.certification_issuer || 'Unlock Labs'
  )
  linkedinIntent.searchParams.set('certUrl', certificationUrl)
  linkedinIntent.searchParams.set('certId', tokenId)

  // Expiration date
  if (certificateData?.certification?.expiration) {
    const expirationDate = new Date(
      certificateData?.certification?.expiration * 1000
    )
    linkedinIntent.searchParams.set(
      'expirationYear',
      expirationDate.getFullYear().toString()
    )
    linkedinIntent.searchParams.set(
      'expirationMonth',
      `${expirationDate.getMonth() + 1}`
    )
  }

  // Mint date

  if (certificateData?.certification?.minted) {
    const issueDate = new Date(certificateData?.certification?.minted * 1000)

    linkedinIntent.searchParams.set(
      'issueYear',
      issueDate.getFullYear().toString()
    )
    linkedinIntent.searchParams.set('issueMonth', `${issueDate.getMonth() + 1}`)
  }

  return (
    <Button
      target="_blank"
      as="a"
      href={linkedinIntent.toString()}
      iconLeft={<LinkedinIcon size={30} />}
    >
      Share on LinkedIn
    </Button>
  )
}

export default LinkedinShareButton
