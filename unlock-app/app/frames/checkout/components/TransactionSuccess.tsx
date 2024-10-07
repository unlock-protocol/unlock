import React from 'react'
import { DefaultImage } from './DefaultImage'

export function TransactionSuccess({ lock }: any) {
  const rightSideContent = (
    <div tw="flex-1 flex flex-col justify-center items-center ml-4">
      <p tw="text-6xl">Success! Purchased {lock.name} membership!</p>
    </div>
  )

  return <DefaultImage lock={lock} rightSideContent={rightSideContent} />
}
