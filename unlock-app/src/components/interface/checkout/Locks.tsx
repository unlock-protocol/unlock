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
  setHasMembership: (state: boolean) => void
}

const LoadLock = ({
  address,
  setFocus,
  emitTransactionInfo,
  activePayment,
  network,
  handleFiatAvailable,
  setHasMembership,
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
      emitTransactionInfo={emitTransactionInfo}
      activePayment={activePayment}
      setHasMembership={setHasMembership}
    />
  )
}

interface LocksProps {
  lockAddresses: string[]
  emitTransactionInfo: (info: TransactionInfo) => void
  activePayment: string
  setFocus: (address: string) => void
  focus: string
  network: number
  handleFiatAvailable: () => void
  setHasMembership: (state: boolean) => void
}

export const Locks = ({
  network,
  lockAddresses,
  emitTransactionInfo,
  activePayment,
  setFocus,
  focus,
  handleFiatAvailable,
  setHasMembership,
}: LocksProps) => {
  return (
    <Wrapper>
      {lockAddresses.map((address) => {
        if (!focus || focus === address) {
          return (
            <LoadLock
              handleFiatAvailable={handleFiatAvailable}
              setHasMembership={setHasMembership}
              network={network}
              setFocus={setFocus}
              key={address}
              address={address}
              emitTransactionInfo={emitTransactionInfo}
              activePayment={activePayment}
            />
          )
        }
      })}
    </Wrapper>
  )
}

Locks.defaultProps = {}

const Wrapper = styled.div`
  margin-bottom: 24px;
`
