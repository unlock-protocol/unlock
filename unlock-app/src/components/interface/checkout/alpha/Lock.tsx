import { Tooltip } from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import { useLock } from '~/hooks/useLock'

interface Props {
  name?: string
  address: string
  network: number
  disabled?: string
}

export function Lock({ name, address, network, disabled }: Props) {
  const { lock, getLock } = useLock(
    {
      address,
    },
    network
  )

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLock({
      pricing: true,
    }).then(() => setLoading(false))
  }, [])

  return (
    <button
      disabled={!!disabled}
      onClick={() => {}}
      className="border w-full border-gray-400 shadow p-2 rounded"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-xl"> {name}</h3>
        <div className="grid">
          <p>~$26.61 </p>
          <p>0.01 ETH </p>
        </div>
      </div>
    </button>
  )
}
