import styled from 'styled-components'
import React, { useContext, useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../interface/Layout'
import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import { AuthenticationContext } from '../interface/Authenticate'
import LoginPrompt from '../interface/LoginPrompt'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import { Web3ServiceContext } from '../../utils/withWeb3Service'
import Loading from '../interface/Loading'

export const StripeConnectContent = () => {
  const { account, network: walletNetwork } = useContext(AuthenticationContext)
  const { query } = useRouter()
  const config = useContext(ConfigContext)
  const [hasRole, setHasRole] = useState(false)
  const [loading, setLoading] = useState(true)
  const lockAddress = query.lock

  const lockNetwork =
    query.network && !Array.isArray(query.network) ? parseInt(query.network) : 0
  const completed = query.completed === '1'

  const walletService = useContext(WalletServiceContext)
  const web3Service = useContext(Web3ServiceContext)
  const grantKeyGrantorRole = async () => {
    await walletService.addKeyGranter({
      lockAddress,
      keyGranter: config.keyGranter,
    })
    setHasRole(true)
  }

  useEffect(() => {
    const checkIsKeyGranter = async () => {
      if (completed) {
        const hasRole = await web3Service.isKeyGranter(
          lockAddress,
          config.keyGranter,
          lockNetwork
        )
        setHasRole(hasRole)
      }
      setLoading(false)
    }
    checkIsKeyGranter()
  }, [lockAddress])

  const wrongNetwork = walletNetwork !== lockNetwork

  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle()}</title>
      </Head>
      {!account && (
        <LoginPrompt>
          There is <strong>one final step</strong> to enable credit cards on
          your lock. Please, connect your wallet.
        </LoginPrompt>
      )}
      {account && (
        <Wrapper>
          <Title>Finish your Credit Card Setup</Title>
          <Steps>
            {loading && <Loading />}
            <Step>
              <Button disabled={completed}>Connect Stripe</Button>
              {completed && (
                <Confirmed>Stripe account connected successfulful!</Confirmed>
              )}

              <Text>
                We are using Stripe to enable credit card payments on your lock.
                The funds are directly accessible for you on Stripe and do not
                transit through Unlock.
              </Text>
            </Step>
            <Step>
              <Button
                disabled={!completed || wrongNetwork || hasRole}
                onClick={grantKeyGrantorRole}
              >
                Allow Key Granting
              </Button>
              {hasRole && <Confirmed>The role as been granted!</Confirmed>}
              {wrongNetwork && (
                <Error>
                  Please connect your wallet to{' '}
                  {ETHEREUM_NETWORKS_NAMES[lockNetwork]}
                </Error>
              )}
              <Text>
                Once a member has paid for their membership, we will grant them
                a key to your lock. For this, we need you to grant us the role
                of key granter on your lock. We do not have any other
                administrative right.
              </Text>
            </Step>
          </Steps>
          <BackToDashboard href="/dashboard">
            <a>Back to dashboard</a>
          </BackToDashboard>
        </Wrapper>
      )}
    </Layout>
  )
}

export default StripeConnectContent

const Wrapper = styled.div``
const Title = styled.h1``
const Steps = styled.div`
  display: flex;
`
const Step = styled.div``
const BackToDashboard = styled(Link)``
const Button = styled.button``
const Text = styled.p``

const Error = styled(Text)`
  color: var(--red);
`

const Confirmed = styled(Text)`
  color: var(--green);
`
