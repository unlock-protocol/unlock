'use client'

import { Button } from '@unlock-protocol/ui'
import { usePrivy } from '@privy-io/react-auth'
import { useState } from 'react'
import Link from 'next/link'
import { onSignedInWithPrivy } from '~/config/PrivyProvider'
import { ToastHelper } from '../helpers/toast.helper'

export default function MigrationFeedback({ walletPk }: { walletPk: string }) {
  // @ts-ignore
  const { importWallet } = usePrivy()
  const [isImporting, setIsImporting] = useState(false)
  const [isImported, setIsImported] = useState(false)

  const handleImport = async () => {
    setIsImporting(true)
    try {
      // First attempt the wallet import
      const importResult = await importWallet({ privateKey: walletPk })

      if (!importResult) {
        ToastHelper.error(
          'Failed to import wallet. Please ensure your private key is correct and try again.'
        )
        return
      }

      // Only proceed with dashboard authentication if wallet import was successful
      try {
        await onSignedInWithPrivy()
        setIsImported(true)
      } catch (authError) {
        console.error('Failed to fully authenticate with dashboard:', authError)
        ToastHelper.error(
          'Wallet imported successfully, but authentication failed. Please try signing in again to use the dashboard.'
        )
      }
    } catch (importError) {
      console.error('Failed to import wallet:', importError)
      ToastHelper.error('Failed to import wallet. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {!isImported ? (
        <>
          <p className="">
            Your wallet will now be managed securely by Privy, making it easier
            to access your assets across devices. Click below to proceed with
            the migration.
          </p>

          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? 'Importing Wallet...' : 'Start Migration'}
          </Button>
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">Migration Successful!</div>
          <p className="text-gray-700">
            Your wallet has been successfully migrated. You can now return to
            the dashboard.
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <Link href="/settings">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
