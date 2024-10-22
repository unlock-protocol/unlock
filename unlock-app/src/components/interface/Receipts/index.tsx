'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { ReceiptBox } from './elements/ReceiptBox'
import { CloseReceiptButton } from './elements/CloseReceiptButton'
import { Button } from '@unlock-protocol/ui'

export const ReceiptsContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const hasParams =
    searchParams.get('network') &&
    searchParams.get('address') &&
    searchParams.get('hash')
  const network = Number(searchParams.get('network'))
  const lockAddress = searchParams.get('address') as string

  let hashes: string[] = []
  const hashParam = searchParams.get('hash')
  if (typeof hashParam === 'string') {
    hashes.push(hashParam)
  } else if (Array.isArray(searchParams.getAll('hash'))) {
    hashes = searchParams.getAll('hash')
  }

  return (
    <>
      {hasParams ? (
        <>
          <div className="flex flex-col items-center">
            <CloseReceiptButton lockAddress={lockAddress} network={network} />
            <h1 className="mb-10 text-4xl font-bold">Receipt details</h1>
            <div className="flex flex-col items-center w-full gap-4">
              {hashes?.map((hash) => {
                return (
                  <ReceiptBox
                    key={hash}
                    lockAddress={lockAddress}
                    network={network}
                    hash={hash}
                  />
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center mt-10">
          <Button
            onClick={() => {
              router.push('keychain')
            }}
          >
            To the main page
          </Button>
        </div>
      )}
    </>
  )
}

export default ReceiptsContent
