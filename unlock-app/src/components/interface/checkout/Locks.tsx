import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Lock } from './Lock'
import { LoadingLock } from './LockVariations'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'

interface LoadLockProps {
  address: string
  emitTransactionInfo: (info: TransactionInfo) => void
  activePayment: string
  setFocus: (address: string) => void
  network: number
  handleFiatAvailable: () => void
  setHasKey: (key: any) => void
  name: string
}

const LoadLock = ({
  address,
  setFocus,
  emitTransactionInfo,
  activePayment,
  network,
  handleFiatAvailable,
  setHasKey,
  name,
}: LoadLockProps) => {
  const web3Service = useContext(Web3ServiceContext)
  const [loading, setLoading] = useState(true)
  const [lock, setLock] = useState({})

  useEffect(() => {
    const loadLock = async () => {
      const lockDetails = await web3Service.getLock(address, network)
      setLock({
        address,
        ...lockDetails,
      })
      setLoading(false)
    }
    if (web3Service) {
      loadLock()
    }
  }, [address, web3Service])

  if (loading || !web3Service) {
    return <LoadingLock address={address} network={network} />
  }
  return (
    <Lock
      network={network}
      handleFiatAvailable={handleFiatAvailable}
      setFocus={setFocus}
      lock={lock}
      name={name}
      emitTransactionInfo={emitTransactionInfo}
      activePayment={activePayment}
      setHasKey={setHasKey}
    />
  )
}

interface LocksProps {
  locks: Object[]
  emitTransactionInfo: (info: TransactionInfo) => void
  activePayment: string
  setFocus: (address: string) => void
  focus: string
  network: number
  handleFiatAvailable: () => void
  setHasKey: (key: any) => void
}

interface LockProps {
  network?: number
  name?: string
}

export const Locks = ({
  network,
  locks,
  emitTransactionInfo,
  activePayment,
  setFocus,
  focus,
  handleFiatAvailable,
  setHasKey,
}: LocksProps) => {
  return (
    <Wrapper>
      {Object.entries(locks).map(
        ([address, lockProps]: [string, LockProps]) => {
          if (!focus || focus === address) {
            return (
              <LoadLock
                handleFiatAvailable={handleFiatAvailable}
                setHasKey={setHasKey}
                network={lockProps?.network || network}
                setFocus={setFocus}
                key={address}
                address={address}
                name={lockProps?.name || ''}
                emitTransactionInfo={emitTransactionInfo}
                activePayment={activePayment}
              />
            )
          }
        }
      )}
    </Wrapper>
  )
}

Locks.defaultProps = {}

const Wrapper = styled.div`
  margin-bottom: 24px;
`
