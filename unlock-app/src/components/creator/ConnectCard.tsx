import React, { useState, useEffect } from 'react'
import { useWalletService } from '~/utils/withWalletService'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useAccount } from '../../hooks/useAccount'
import Loading from '../interface/Loading'
import useLock from '../../hooks/useLock'
import { useStorageService } from '../../utils/withStorageService'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Badge, Button } from '@unlock-protocol/ui'
import { FiCheckCircle as CheckIcon } from 'react-icons/fi'
import { ToastHelper } from '../helpers/toast.helper'

interface ConnectCardProps {
  lockNetwork: number
  lock: any
}

export const ConnectCard = ({ lockNetwork, lock }: ConnectCardProps) => {
  const { network: walletNetwork, account } = useAuth()
  const web3Service = useWeb3Service()
  const walletService = useWalletService()
  const storageService = useStorageService()
  const [keyGranter, setKeyGranter] = useState('')

  const { isStripeConnected } = useLock({ address: lock.address }, lockNetwork)
  const { connectStripeToLock, disconnectStripeFromLock } = useAccount(
    account!,
    walletNetwork!
  )

  const disconnectStripe = async () => {
    const res = await disconnectStripeFromLock({
      lockAddress: lock.address,
      network: lockNetwork,
    })
    if (res?.ok) {
      ToastHelper.success('Stripe succesfully disconnected')
      setIsConnected(-1)
    } else {
      ToastHelper.error('There is some issue, please try again')
    }
  }

  const connectStripe = async () => {
    const redirectUrl = await connectStripeToLock(
      lock.address,
      lockNetwork,
      window.location.origin
    )
    if (!redirectUrl) {
      return console.error(
        'We could not connect your lock to a Stripe account. Please try again later.'
      )
    }
    window.location.href = redirectUrl
  }

  const [isConnected, setIsConnected] = useState(-1)
  const [hasRole, setHasRole] = useState(false)
  const [loading, setLoading] = useState(true)

  const grantKeyGrantorRole = async () => {
    await walletService.addKeyGranter({
      lockAddress: lock.address,
      keyGranter,
    })
    setHasRole(true)
  }

  useEffect(() => {
    const checkIsKeyGranter = async (keyGranter: string) => {
      const hasRole = await web3Service.isKeyGranter(
        lock.address,
        keyGranter,
        lockNetwork
      )
      setHasRole(hasRole)
    }

    const checkIsConnected = async () => {
      const isConnected = await isStripeConnected()
      setIsConnected(isConnected)
    }

    const checkState = async () => {
      setLoading(true)
      const _keyGranter = await storageService.getKeyGranter(lockNetwork)
      await checkIsConnected()
      await checkIsKeyGranter(_keyGranter)
      setLoading(false)
      setKeyGranter(_keyGranter)
    }
    checkState()
  }, [
    lock.address,
    lockNetwork,
    isConnected,
    storageService,
    setLoading,
    setKeyGranter,
    web3Service,
    setHasRole,
    keyGranter,
  ])

  const wrongNetwork = walletNetwork !== lockNetwork
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            {isConnected === 1 && (
              <>
                <Badge variant="green">
                  <div className="flex items-center gap-1">
                    <CheckIcon />
                    <span>Stripe Connected</span>
                  </div>
                </Badge>
                <Button
                  onClick={disconnectStripe}
                  className="mt-2"
                  size="tiny"
                  variant="outlined-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Disconnect Stripe</span>
                  </div>
                </Button>
              </>
            )}

            {isConnected === -1 && (
              <Button
                variant="outlined-primary"
                size="tiny"
                onClick={connectStripe}
              >
                Connect Stripe
              </Button>
            )}

            {isConnected === 0 && (
              <>
                <Button
                  color="var(--red)"
                  size="tiny"
                  variant="outlined-primary"
                  onClick={connectStripe}
                >
                  Connect Stripe
                </Button>
                <span className="text-xs text-red-500 leading-1">
                  You have started connecting your Stripe account, but you are
                  not approved for charges yet. Please complete the application
                  with Stripe or try again in a few hours.
                </span>
              </>
            )}

            {isConnected !== 1 && (
              <span className="block mt-1 text-xs">
                You will be prompted to sign a message to connect your lock to a
                Stripe account.
              </span>
            )}
          </div>
          <div>
            {!hasRole && (
              <Button
                variant="outlined-primary"
                size="tiny"
                disabled={wrongNetwork || hasRole}
                onClick={grantKeyGrantorRole}
              >
                Allow Key Granting
              </Button>
            )}
            {hasRole && (
              <Badge
                className="cursor-pointer"
                variant="green"
                onClick={grantKeyGrantorRole}
              >
                <div className="flex items-center gap-1">
                  <CheckIcon />
                  <span>Role granted</span>
                </div>
              </Badge>
            )}
            {wrongNetwork && (
              <span className="text-xs text-red-500 leading-1">
                Please connect your wallet to{' '}
                {ETHEREUM_NETWORKS_NAMES[lockNetwork]}
              </span>
            )}
            <span className="block mt-1 text-xs">
              We need you to grant us the role of key granter on your lock so we
              can grant an NFT to anyone who pays with a card.
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default ConnectCard
