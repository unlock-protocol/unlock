import styled from 'styled-components'
import React, { useState, useEffect } from 'react'
import { useWalletService } from '~/utils/withWalletService'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useAccount } from '../../hooks/useAccount'
import Loading from '../interface/Loading'
import useLock from '../../hooks/useLock'
import SvgComponents from '../interface/svg'
import { useStorageService } from '../../utils/withStorageService'
import { useWeb3Service } from '~/utils/withWeb3Service'

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
  const { connectStripeToLock } = useAccount(account!, walletNetwork!)

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
    isStripeConnected,
  ])

  const wrongNetwork = walletNetwork !== lockNetwork
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <Steps>
          <Step>
            {isConnected === 1 && (
              <Button done>
                <SvgComponents.Checkmark /> Stripe Connected
              </Button>
            )}

            {isConnected === -1 && (
              <Button done={false} onClick={connectStripe}>
                <SvgComponents.Arrow /> Connect Stripe
              </Button>
            )}

            {isConnected === 0 && (
              <>
                <Button color="var(--red)" done={false} onClick={connectStripe}>
                  <SvgComponents.Arrow /> Connect Stripe
                </Button>
                <Warning>
                  You have started connecting your Stripe account, but you are
                  not approved for charges yet. Please complete the application
                  with Stripe or try again in a few hours.
                </Warning>
              </>
            )}

            <Text>
              You will be prompted to sign a message to connect your lock to a
              Stripe account.
            </Text>
          </Step>
          <Step>
            {!hasRole && (
              <Button
                done={false}
                disabled={wrongNetwork || hasRole}
                onClick={grantKeyGrantorRole}
              >
                <SvgComponents.Arrow /> Allow Key Granting
              </Button>
            )}
            {hasRole && (
              <Button done onClick={grantKeyGrantorRole}>
                <SvgComponents.Checkmark /> Role granted
              </Button>
            )}
            {wrongNetwork && (
              <Error>
                Please connect your wallet to{' '}
                {ETHEREUM_NETWORKS_NAMES[lockNetwork]}
              </Error>
            )}
            <Text>
              We need you to grant us the role of key granter on your lock so we
              can grant an NFT to anyone who pays with a card.
            </Text>
          </Step>
        </Steps>
      )}
    </>
  )
}

interface ButtonProps {
  done: boolean
  color?: string
}

const Button = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  border: 1px solid;
  border-color: ${(props) =>
    props.done ? 'var(--green)' : props.color || 'var(--blue)'};
  color: ${(props) =>
    props.done ? 'var(--green)' : props.color || 'var(--blue)'};
  cursor: ${(props) => (props.done ? 'auto' : 'pointer')};
  border-radius: 3px;
  background-color: transparent;
  padding-right: 10px;
  svg {
    height: 32px;
    fill: ${(props) =>
      props.done ? 'var(--green)' : props.color || 'var(--blue)'};
  }
`

const Steps = styled.div`
  margin-top: 10px;
  display: flex;
`

const Step = styled.div``

const Text = styled.p`
  font-size: 12px;
  margin-right: 12px;
`

const Error = styled(Text)`
  color: var(--red);
`

const Warning = styled(Text)`
  color: var(--red);
`

export default ConnectCard
