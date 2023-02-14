import { useRouter } from 'next/router'
import React from 'react'
import { ReceiptBox } from './elements/ReceiptBox'

export const ReceiptsPage = () => {
  const { query } = useRouter()

  const hasParams = query.network && query.address && query.hash

  let hashes: string[] = []
  if (typeof query.hash === 'string') {
    hashes.push(query.hash)
  } else if (typeof query.hash?.length && query.hash) {
    hashes = query.hash
  }

  return (
    <>
      {hasParams && (
        <>
          <div className="flex flex-col items-center">
            <h1 className="mb-10 text-4xl font-bold">Receipt details</h1>
            <div className="flex flex-col items-center w-full gap-4">
              {hashes?.map((hash) => {
                return (
                  <ReceiptBox
                    key={hash}
                    lockAddress={query!.address as string}
                    network={Number(query.network)}
                    hash={hash}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ReceiptsPage
