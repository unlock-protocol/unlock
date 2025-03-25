'use client'

import { useMutation } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { useState, useEffect } from 'react'
import { FaFileCsv as CsvIcon } from 'react-icons/fa'
import { useLockManager } from '~/hooks/useLockManager'
import { locksmith } from '~/config/locksmith'
import { useMetadata } from '~/hooks/metadata'
import { getLockTypeByMetadata } from '@unlock-protocol/core'
import { ToastHelper } from '@unlock-protocol/ui'
import { downloadAsCSV } from '~/utils/download'

interface ActionBarProps {
  lockAddress: string
  network: number
  setIsOpen: (open: boolean) => void
  isOpen: boolean
  page: number
}

export const ActionBar = ({ lockAddress, network }: ActionBarProps) => {
  const { isPending: isLoadingMetadata, data: metadata } = useMetadata({
    lockAddress,
    network,
  })

  const { isEvent } = getLockTypeByMetadata(metadata)
  const [keysJobId, setKeysJobId] = useState<string | null>(null)
  const [isKeysJobLoading, setIsKeysJobLoading] = useState<boolean>(false)

  const onDownloadCsvMutation = useMutation({
    mutationFn: async () => {
      ToastHelper.success(
        'It may take a few minutes for the file to be generated. Please do not close this page'
      )
      const response = await locksmith.exportKeys(
        network,
        lockAddress,
        '',
        'owner',
        'all',
        'minted'
      )
      if (response.status === 200 && response.data.jobId) {
        setKeysJobId(response.data.jobId)
        setIsKeysJobLoading(true)
      } else {
        console.error('Failed to start download job', response)
        ToastHelper.error(`Failed to start download job: ${response}`)
      }
    },
    onError: (error) => {
      ToastHelper.error(`Failed to download members list: ${error}`)
      console.error('Failed to download members list', error)
      setIsKeysJobLoading(false)
    },
  })

  useEffect(() => {
    let intervalId: any = null

    const fetchKeysJob = async () => {
      if (!keysJobId) return

      const response = await locksmith.getExportedKeys(
        network,
        lockAddress,
        keysJobId
      )
      if (response.status != 200) {
        return
      }

      clearInterval(intervalId)
      setIsKeysJobLoading(false)

      const members = response.data
      const cols: { [key: string]: boolean } = { token: true, data: false }
      if (members.keys) {
        for (let i = 0; i < members.keys.length; i++) {
          Object.keys(members.keys[i]).forEach((key) => {
            cols[key] = true
          })
        }
      }
      delete cols.data
      downloadAsCSV({
        cols: Object.keys(cols),
        metadata: members.keys as any[],
      })
    }

    if (isKeysJobLoading) {
      intervalId = setInterval(fetchKeysJob, 2000)
    }

    return () => clearInterval(intervalId)
  }, [keysJobId, isKeysJobLoading, lockAddress, network])

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  return (
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-brand-ui-primary">
        {isEvent ? 'Attendees' : 'Members'}
      </span>
      {isManager && (
        <div className="flex gap-2">
          <Button
            variant="outlined-primary"
            size="small"
            disabled={isLoadingMetadata || isKeysJobLoading}
            loading={onDownloadCsvMutation.isPending || isKeysJobLoading}
            iconLeft={<CsvIcon className="text-brand-ui-primary" size={16} />}
            onClick={() => onDownloadCsvMutation.mutate()}
          >
            Download {isEvent ? 'attendee' : 'member'} list
          </Button>
        </div>
      )}
    </div>
  )
}
