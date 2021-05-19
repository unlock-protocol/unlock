import styled from 'styled-components'
import React, { useContext, useState, useEffect } from 'react'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'
import { AuthenticationContext } from '../interface/Authenticate'
import { ConfigContext } from '../../utils/withConfig'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import { useAccount } from '../../hooks/useAccount'

import Loading from '../interface/Loading'
import useLock from '../../hooks/useLock'
import SvgComponents from '../interface/svg'

interface ConnectCardProps {
  lockNetwork: number
  lockAddress: string
}

export const ConnectCard = ({ lockNetwork, lockAddress }: ConnectCardProps) => {
  const { network: walletNetwork, account } = useContext(AuthenticationContext)
  const web3Service = useContext(Web3ServiceContext)
  const walletService = useContext(WalletServiceContext)
  const config = useContext(ConfigContext)

  const { isStripeConnected } = useLock({ address: lockAddress }, lockNetwork)
  const { connectStripeToLock } = useAccount(account, walletNetwork)

  const connectStripe = async () => {
    const redirectUrl = await connectStripeToLock(
      lockAddress,
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

  const [isConnected, setIsConnected] = useState(false)
  const [hasRole, setHasRole] = useState(false)
  const [loading, setLoading] = useState(true)

  const grantKeyGrantorRole = async () => {
    await walletService.addKeyGranter({
      lockAddress,
      keyGranter: config.keyGranter,
    })
    setHasRole(true)
  }

  const checkIsKeyGranter = async () => {
    const hasRole = await web3Service.isKeyGranter(
      lockAddress,
      config.keyGranter,
      lockNetwork
    )
    setHasRole(hasRole)
  }

  const checkIsConnected = async () => {
    const isConnected = await isStripeConnected()
    setIsConnected(isConnected)
  }

  useEffect(() => {
    const checkState = async () => {
      setLoading(true)
      await checkIsConnected()
      await checkIsKeyGranter()
      setLoading(false)
    }
    checkState()
  }, [lockAddress, lockNetwork, isConnected])

  const wrongNetwork = walletNetwork !== lockNetwork

  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <Steps>
          <Step>
            {isConnected && (
              <Button done disabled={isConnected}>
                <SvgComponents.Checkmark /> Stripe Connected
              </Button>
            )}
            {!isConnected && (
              <Button
                done={false}
                disabled={isConnected}
                onClick={connectStripe}
              >
                <SvgComponents.Arrow /> Connect Stripe
              </Button>
            )}

            <Text>
              You will be prompted to sign a message to start connecting your
              lock to a Stripe account. You will then be redirect to Stripe to
              complete your application.
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
              Once a member has paid for their membership with their card, we
              will grant them a key (NFT) to your lock. For this, we need you to
              grant us the role of key granter on your lock.
            </Text>
          </Step>
        </Steps>
      )}
    </>
  )
}

interface ButtonProps {
  done: boolean
}

const Button = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  border: 1px solid;
  border-color: ${(props) => (props.done ? 'var(--green)' : 'var(--blue)')};
  color: ${(props) => (props.done ? 'var(--green)' : 'var(--blue)')};
  cursor: ${(props) => (props.done ? 'auto' : 'pointer')};
  border-radius: 3px;
  background-color: transparent;
  padding-right: 10px;
  svg {
    height: 32px;
    fill: ${(props) => (props.done ? 'var(--green)' : 'var(--blue)')};
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
export default ConnectCard
