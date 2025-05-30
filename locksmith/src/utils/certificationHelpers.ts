import { toFormData } from '@unlock-protocol/core'
import config from '../config/config'

interface LinkedinShareProps {
  tokenId: string
  metadata: any
}

const getCertificationPath = ({
  metadata,
  tokenId,
}: LinkedinShareProps): string => {
  const slug = metadata?.slug

  if (slug) {
    return `${config.unlockApp}/certification/${slug}`
  }

  if (tokenId) {
    return `${config.unlockApp}/certification/${slug}/${tokenId}`
  }

  return `${config.unlockApp}/certification/${slug}`
}

export const getCertificateLinkedinShareUrl = ({
  tokenId,
  metadata,
}: LinkedinShareProps): string | null => {
  const certificateData = toFormData(metadata)

  const certificationUrl = getCertificationPath({
    metadata,
    tokenId,
  })

  if (!metadata.name || !certificateData) {
    return null
  }

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

  return linkedinIntent.toString()
}
