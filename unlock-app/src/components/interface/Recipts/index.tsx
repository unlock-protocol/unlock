import { useRouter } from 'next/router'
import React from 'react'
import { ReceiptBox } from './elements/ReceiptBox'

export const ReceiptsPage = () => {
  const { query } = useRouter()

  const hasParams = query.network && query.address && query.hash

  return (
    <>
      {hasParams && (
        <div className="flex flex-col items-center">
          <ReceiptBox
            lockAddress={query!.address as string}
            network={Number(query.network)}
            hash={query.hash as string}
          />
        </div>
      )}
    </>
  )
}

export default ReceiptsPage
