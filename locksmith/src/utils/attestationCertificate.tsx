import normalizer from './normalizer'
import { Certificate, minifyAddress } from '@unlock-protocol/ui'
import satori from 'satori'
import dayjs from '../config/dayjs'
import { readFileSync } from 'fs'
import { networks } from '@unlock-protocol/networks'
import { imageUrlToBase64 } from './image'

const inter400 = readFileSync('src/fonts/inter-400.woff')
const inter700 = readFileSync('src/fonts/inter-700.woff')

interface AttestationCertificateOptions {
  network: number
  lockAddress: string
  tokenId: string
  attestationId: string
  attestationData: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lockMetadata?: any
}

/**
 * Creates a certificate SVG for an attestation using the satori library.
 */
export const createAttestationCertificate = async ({
  network,
  lockAddress: lock,
  tokenId,
  attestationId,
  attestationData,
  lockMetadata,
}: AttestationCertificateOptions) => {
  const lockAddress = normalizer.ethereumAddress(lock)

  const attributes: Record<string, string>[] = lockMetadata?.attributes || []

  const object = attributes.reduce<Record<string, string>>(
    (item, { trait_type, value }) => {
      item[trait_type] = value as string
      return item
    },
    {}
  )

  // Get image as base64 for embedding in SVG
  // Satori throws if <img src=""> is empty, so use a 1x1 transparent PNG as fallback
  const PLACEHOLDER_IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII='
  let imageBase64 = PLACEHOLDER_IMAGE
  if (lockMetadata?.image) {
    try {
      imageBase64 = await imageUrlToBase64(lockMetadata.image, lockAddress)
    } catch {
      // Keep placeholder if image fetch fails
    }
  }

  const issueDate = dayjs().format('DD MMM YYYY')

  const certificate = await satori(
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Certificate
        name={lockMetadata?.name || 'Certification'}
        description={lockMetadata?.description || ''}
        tokenId={tokenId}
        owner={tokenId}
        issuer={object?.certification_issuer || ''}
        image={imageBase64}
        lockAddress={minifyAddress(lockAddress)}
        network={network}
        networkName={networks[network]?.name}
        transactionsHash=""
        externalUrl={lockMetadata?.external_url}
        issueDate={issueDate}
        attestation={{
          attestationId,
          firstName: attestationData.firstName,
          lastName: attestationData.lastName,
        }}
      />
    </div>,
    {
      // A4 landscape format in pixels
      width: 1754,
      height: 1240,
      fonts: [
        {
          name: 'Inter',
          data: inter400,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Inter',
          data: inter700,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )

  return certificate
}
