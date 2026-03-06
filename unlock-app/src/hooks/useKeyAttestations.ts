import { useQuery } from '@tanstack/react-query'
import { locksmithClient } from '~/config/locksmith'
import { config } from '~/config/app'

interface Attestation {
  id: string
  lockAddress: string
  network: number
  tokenId: string
  schemaId: string
  attestationId: string
  txHash: string | null
  data: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface UseGetAttestationsForKeyProps {
  lockAddress: string
  network: number
  owner: string
}

export const useGetAttestationsForKey = ({
  lockAddress,
  network,
  owner,
}: UseGetAttestationsForKeyProps) => {
  return useQuery<Attestation[]>({
    queryKey: ['getAttestationsForKey', network, lockAddress, owner],
    queryFn: async () => {
      try {
        const response = await locksmithClient.get(
          `${config.locksmithHost}/v2/attestations/${network}/${lockAddress}/my-attestations`
        )
        return response.data
      } catch (error) {
        return []
      }
    },
    enabled: !!lockAddress && !!network && !!owner,
  })
}

export const downloadAttestationPdf = async ({
  lockAddress,
  network,
  attestationId,
}: {
  lockAddress: string
  network: number
  attestationId: string
}) => {
  const response = await locksmithClient.get(
    `${config.locksmithHost}/v2/attestations/${network}/${lockAddress}/${attestationId}/download`,
    {
      responseType: 'blob',
    }
  )

  // Create a blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  // Extract filename from Content-Disposition header if available
  const contentDisposition = response.headers['content-disposition']
  let filename = 'attestation-certificate.pdf'
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
    if (filenameMatch) {
      filename = filenameMatch[1]
    }
  }

  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
