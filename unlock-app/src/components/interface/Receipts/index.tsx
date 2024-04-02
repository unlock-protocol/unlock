import { useRouter } from 'next/router'
import React from 'react'
import { ReceiptBox } from './elements/ReceiptBox'
import { CloseReceiptButton } from './elements/CloseReceiptButton'
import { Button } from '@unlock-protocol/ui'

export const ReceiptsPage = () => {
  const router = useRouter()

  const hasParams =
    router.query.network && router.query.address && router.query.hash
  const network = Number(router.query.network)
  const lockAddress = router.query!.address as string

  let hashes: string[] = []
  if (typeof router.query.hash === 'string') {
    hashes.push(router.query.hash)
  } else if (typeof router.query.hash?.length && router.query.hash) {
    hashes = router.query.hash
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

export default ReceiptsPage
