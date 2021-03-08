import React, { useContext, useState, useEffect } from 'react'
import { Lock, LoggedOutLock } from './Lock'
import { LoadingLock } from './LockVariations'
import { TransactionInfo } from '../../../hooks/useCheckoutCommunication'
import { Web3ServiceContext } from '../../../utils/withWeb3Service'

interface LoadLockProps {
  address: string
  emitTransactionInfo: (info: TransactionInfo) => void
  authenticated: boolean
  activePayment: string
  setFocus: (address: string) => void
  authenticate: () => void
  network: string
}

const LoadLock = ({
  address,
  setFocus,
  emitTransactionInfo,
  authenticated,
  authenticate,
  activePayment,
  network,
}: LoadLockProps) => {
  const web3Service = useContext(Web3ServiceContext)
  const [loading, setLoading] = useState(true)
  const [lock, setLock] = useState({})

  useEffect(() => {
    const loadLock = async () => {
      const lockDetails = await web3Service.getLock(address)
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
    return <LoadingLock address={address} />
  }

  if (!authenticated) {
    return (
      <LoggedOutLock network={network} lock={lock} onClick={authenticate} />
    )
  }

  return (
    <Lock
      setFocus={setFocus}
      lock={lock}
      emitTransactionInfo={emitTransactionInfo}
      authenticated={authenticated}
      activePayment={activePayment}
    />
  )
}

interface LocksProps {
  lockAddresses: string[]
  emitTransactionInfo: (info: TransactionInfo) => void
  activePayment: string
  setFocus: (address: string) => void
  focus: string
  authenticated: boolean
  authenticate: () => void
  network: string
}

export const Locks = ({
  network,
  authenticate,
  authenticated,
  lockAddresses,
  emitTransactionInfo,
  activePayment,
  setFocus,
  focus,
}: LocksProps) => {
  return (
    <div>
      {lockAddresses.map((address) => {
        if (!focus || focus === address) {
          return (
            <LoadLock
              network={network}
              authenticate={authenticate}
              authenticated={authenticated}
              setFocus={setFocus}
              key={address}
              address={address}
              emitTransactionInfo={emitTransactionInfo}
              activePayment={activePayment}
            />
          )
        }
      })}
    </div>
  )
}

Locks.defaultProps = {}
