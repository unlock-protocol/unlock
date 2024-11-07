'use client'

import { Button } from '@unlock-protocol/ui'
import { usePrivy } from '@privy-io/react-auth'
import { useState } from 'react'

export default function MigrationFeedback({ walletPk }: { walletPk: string }) {
  // @ts-ignore
  const { importWallet } = usePrivy()
  const [isImporting, setIsImporting] = useState(false)
  const [isImported, setIsImported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)
    try {
      await importWallet({ privateKey: walletPk })
      setIsImported(true)
    } catch (error) {
      console.error('Failed to import wallet:', error)
      setError('Failed to import wallet. Please try again.')
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
          {error && <p className="text-red-500">{error}</p>}

          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? <>Importing Wallet...</> : 'Start Migration'}
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
            <Button href="/dashboard">Return to Dashboard</Button>
          </div>
        </>
      )}
    </div>
  )
}
