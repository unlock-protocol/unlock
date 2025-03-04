'use client'

import { Placeholder } from '@unlock-protocol/ui'

const LocksLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Locks</h1>
      <div className="w-full text-base text-gray-700">
        <span className="w-full max-w-lg text-base text-gray-700">
          A Lock is a membership smart contract you create, deploy, and own on
          Unlock Protocol
        </span>
      </div>
      <Placeholder.Root>
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
        <Placeholder.Card />
      </Placeholder.Root>
    </div>
  )
}

export default LocksLoading
