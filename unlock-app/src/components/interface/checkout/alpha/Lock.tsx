import React, { useEffect, useState } from 'react'
import { useLock } from '~/hooks/useLock'

interface Props {
  name?: string
  address: string
  network: number
}

export function Lock({ name, address, network }: Props) {
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

  return <div>{name}</div>
}
