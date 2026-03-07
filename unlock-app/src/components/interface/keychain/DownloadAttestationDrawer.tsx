import { Drawer, Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { TbDownload as DownloadIcon } from 'react-icons/tb'
import { downloadAttestationPdf } from '~/hooks/useKeyAttestations'
import { ToastHelper } from '@unlock-protocol/ui'
import dayjs from 'dayjs'

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

interface DownloadAttestationDrawerProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  attestations: Attestation[]
  lockAddress: string
  network: number
}

export const DownloadAttestationDrawer = ({
  isOpen,
  setIsOpen,
  attestations,
  lockAddress,
  network,
}: DownloadAttestationDrawerProps) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (attestation: Attestation) => {
    setDownloadingId(attestation.attestationId)
    try {
      await downloadAttestationPdf({
        lockAddress,
        network,
        attestationId: attestation.attestationId,
      })
      ToastHelper.success('Certificate downloaded successfully!')
    } catch (error) {
      console.error('Failed to download attestation:', error)
      ToastHelper.error('Failed to download certificate. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="grid gap-6">
        <header className="flex flex-col items-center w-full gap-2">
          <h1 className="text-xl font-bold">Download Attestation</h1>
          <p className="text-gray-500 text-center">
            Select an attestation certificate to download
          </p>
        </header>

        <div className="divide-y divide-gray-200">
          {attestations.map((attestation) => {
            const firstName = attestation.data?.firstName || ''
            const lastName = attestation.data?.lastName || ''
            const name =
              firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : 'Attestation'
            const date = dayjs(attestation.createdAt).format('MMM D, YYYY')
            const isDownloading = downloadingId === attestation.attestationId

            return (
              <div
                key={attestation.attestationId}
                className="flex items-center justify-between py-4"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{name}</span>
                  <span className="text-sm text-gray-500">{date}</span>
                </div>
                <Button
                  size="small"
                  variant="outlined-primary"
                  iconLeft={<DownloadIcon />}
                  loading={isDownloading}
                  disabled={isDownloading}
                  onClick={() => handleDownload(attestation)}
                >
                  Download
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </Drawer>
  )
}
