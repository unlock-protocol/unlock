import { Button } from '@unlock-protocol/ui'
import { toFormData } from '~/components/interface/locks/metadata/utils'
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

  //
  console.log({ metadata, certificateData })

  const linkedinIntent = new URL('https://www.linkedin.com/profile/add')
  linkedinIntent.searchParams.set('startTask', 'CERTIFICATION_NAME')
  linkedinIntent.searchParams.set('name', metadata.name)
  linkedinIntent.searchParams.set(
    'organizationName',
    certificateData?.certification?.certification_issuer || 'Unlock Labs'
  )
  // Get the mint date?
  if (certificateData?.certification?.Expiration) {
    const expirationDate = new Date(
      certificateData?.certification?.Expiration * 1000
    )
    console.log(expirationDate)
    linkedinIntent.searchParams.set(
      'expirationYear',
      expirationDate.getFullYear().toString()
    )
    linkedinIntent.searchParams.set(
      'expirationMonth',
      `${expirationDate.getMonth() + 1}`
    )
  }
  if (certificateData?.certification?.Minted) {
    const issueDate = new Date(certificateData?.certification?.Minted * 1000)
    console.log(issueDate)

    linkedinIntent.searchParams.set(
      'issueYear',
      issueDate.getFullYear().toString()
    )
    linkedinIntent.searchParams.set('issueMonth', `${issueDate.getMonth() + 1}`)
  }
  linkedinIntent.searchParams.set('certUrl', certificationUrl)
  linkedinIntent.searchParams.set('certId', tokenId)

  return (
    <Button
      target="_blank"
      as="a"
      href={linkedinIntent.toString()}
      iconLeft={<LinkedinIcon size={30} />}
    >
      Share on LinkedIn
      {/* <Link
        target="_blank"
        href={linkedinIntent.toString()}
        className="flex items-center justify-center"
      ></Link> */}
    </Button>
  )
}

export default LinkedinShareButton
