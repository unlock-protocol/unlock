import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useLock } from '../../../hooks/useLock'
import { Lock } from './Lock'
import { LoadingLock } from './LockVariations'

interface LoadLockProps {
  address: string
  network: number
  setHasKey: (key: any) => void
  name: string
  onSelected: (lock: any) => void
}

const LoadLock = ({
  address,
  network,
  setHasKey,
  name,
  onSelected,
}: LoadLockProps) => {
  const [loading, setLoading] = useState(true)
  const { lock, getLock } = useLock({ address }, network)

  useEffect(() => {
    const loadLock = async () => {
      await getLock({ pricing: true })
      setLoading(false)
    }
    loadLock()
  }, [address])

  if (loading) {
    return <LoadingLock address={address} network={network} />
  }
  return (
    <Lock
      network={network}
      lock={lock}
      name={name}
      setHasKey={setHasKey}
      onSelected={onSelected}
    />
  )
}
interface LocksProps {
  locks: any
  network: number
  setHasKey: (key: any) => void
  onSelected: (address: string) => void
}

interface LockProps {
  network?: number
  name?: string
}

export const Locks = ({
  network,
  locks,
  setHasKey,
  onSelected,
}: LocksProps) => {
  return (
    <Wrapper>
      {Object.entries(locks).map(
        ([address, lockProps]: [string, LockProps]) => {
          return (
            <LoadLock
              setHasKey={setHasKey}
              network={lockProps?.network || network}
              key={address}
              address={address}
              name={lockProps?.name || ''}
              onSelected={onSelected}
            />
          )
        }
      )}
    </Wrapper>
  )
}

Locks.defaultProps = {}

const Wrapper = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
`
