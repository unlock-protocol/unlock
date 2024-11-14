'use client'

import { Button } from '@unlock-protocol/ui'
import { usePrivy } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onSignedInWithPrivy } from '~/config/PrivyProvider'
import { FaCheckCircle as CheckIcon } from 'react-icons/fa'
import { ToastHelper } from '../helpers/toast.helper'

export default function MigrationFeedback({
  walletPk,
  onMigrationStart,
  mode,
}: {
  walletPk: string
  onMigrationStart?: () => void
  mode?: 'checkout'
}) {
  // @ts-ignore
  const { importWallet, user } = usePrivy()
  const [isImporting, setIsImporting] = useState(false)
  const [isImported, setIsImported] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasImported, setHasImported] = useState(false)

  const handleImport = async () => {
    setIsImporting(true)
    setImportError(null)
    setAuthError(null)
    onMigrationStart?.()
    try {
      // Attempt the wallet import
      const importResult = await importWallet({ privateKey: walletPk })

      if (!importResult) {
        ToastHelper.error(
          'Failed to import wallet. Please ensure your private key is correct and try again.'
        )
        throw new Error(
          'Failed to import wallet. Please ensure your private key is correct and try again.'
        )
      }

      setHasImported(true)
      // The user state will be updated asynchronously, handled by useEffect
    } catch (error: any) {
      console.error('Failed to import wallet:', error)
      setImportError(
        error.message || 'Failed to import wallet. Please try again.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  useEffect(() => {
    const authenticateUser = async () => {
      if (user && hasImported) {
        try {
          await onSignedInWithPrivy(user)
          setIsImported(true)
        } catch (authError: any) {
          console.error(
            'Failed to fully authenticate with dashboard:',
            authError
          )
          setAuthError(
            'Wallet imported successfully, but authentication failed. Please try signing in again to use the dashboard.'
          )
        }
      }
    }

    authenticateUser()
  }, [user, hasImported])

  const isCheckoutMode = mode === 'checkout'
  const baseTextClasses = 'text-gray-700'
  const successTitleClasses = `text-2xl font-bold ${
    isCheckoutMode ? 'text-center flex flex-col items-center' : ''
  }`

  return (
    <div className="space-y-5">
      {!isImported ? (
        <>
          {!hasImported && (
            <>
              <p
                className={`${isCheckoutMode ? 'text-center' : ''} ${baseTextClasses}`}
              >
                Your wallet will now be managed securely by Privy, making it
                easier to access your assets across devices. Click below to
                proceed with the migration.
              </p>

              {importError && <div className="text-red-500">{importError}</div>}

              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? 'Importing Wallet...' : 'Start Migration'}
              </Button>
            </>
          )}

          {hasImported && !isImported && (
            <>
              {authError && <div className="text-red-500">{authError}</div>}
              {isImporting && <div>Authenticating...</div>}
            </>
          )}
        </>
      ) : (
        <>
          <div className={successTitleClasses}>
            <CheckIcon size={24} className="text-green-500 mb-5" />
            Migration Successful!
          </div>
          {!isCheckoutMode && (
            <>
              <p className={baseTextClasses}>
                Your wallet has been successfully migrated. You can now return
                to the dashboard.
              </p>
              <div className="flex flex-col gap-3 md:flex-row">
                <Link href="/settings">
                  <Button>Return to Dashboard</Button>
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
