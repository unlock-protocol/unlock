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
  linkedinIntent.searchParams.set('issueYear', 'xxx')
  linkedinIntent.searchParams.set('issueMonth', 'xxx')
  linkedinIntent.searchParams.set('expirationYear', 'xxx')
  linkedinIntent.searchParams.set('expirationMonth', 'xxx')
  linkedinIntent.searchParams.set('certUrl', certificationUrl)
  linkedinIntent.searchParams.set('certId', tokenId)

  // https://www.linkedin.com/profile/add?
  // startTask=CERTIFICATION_NAME
  // &name=Test%20Certificate
  // &organizationName=LinkedIn
  // &issueYear=2018
  // &issueMonth=2
  // &expirationYear=2020
  // &expirationMonth=5
  // &certUrl=https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Flearn%2Fcertifications%2Fd365-functional-consultant-sales
  // &certId=1234

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
