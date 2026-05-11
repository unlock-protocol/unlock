import React from 'react'
import { DefaultImage } from './DefaultImage'

export function TransactionSuccess({ lock }: any) {
  const rightSideContent = (
    <div tw="flex flex-col">
      <p>Success !</p>
      <p tw="text-3xl">Purchased {lock.name} membership !</p>
    </div>
  )

  return <DefaultImage lock={lock} rightSideContent={rightSideContent} />
}
