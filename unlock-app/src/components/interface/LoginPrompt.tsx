import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ConfigContext } from '../../utils/withConfig'

import { AuthenticationContext } from './Authenticate'
import { ActionButton } from './buttons/ActionButton'
import LogInSignUp from './LogInSignUp'

interface LoginPromptProps {
  unlockUserAccount?: boolean
  onCancel?: () => void
  embedded?: boolean
  details?: string
}

export interface EthereumWindow extends Window {
  ethereum?: any
  web3?: any
}

export const selectProvider = (config: any) => {
  let provider
  if (config?.isServer) {
    return null
  }
  const ethereumWindow: EthereumWindow = window
  if (config?.env === 'test') {
    // We set the provider to be the provider by the local ganache
    provider = `http://${config.httpProvider}:8545`
  } else if (ethereumWindow && ethereumWindow.ethereum) {
    provider = ethereumWindow.ethereum
  } else if (ethereumWindow.web3) {
    // Legacy web3 wallet/browser (should we keep supporting?)
    provider = ethereumWindow.web3.currentProvider
  } else {
    // TODO: Let's let the user pick one up from the UI (including the unlock provider!)
  }
  return provider
}

interface RpcType {
  [network: string]: string
}

export const rpcForWalletConnect = (config: any) => {
  const rpc: RpcType = {}
  Object.keys(config.networks).forEach((key) => {
    rpc[key] = config.networks[key].provider
  })
  return rpc
}

const LoginPrompt = ({
  details,
  unlockUserAccount,
  onCancel,
  embedded,
}: LoginPromptProps) => {
  const config = useContext(ConfigContext)
  const { authenticate } = useContext(AuthenticationContext)
  const [walletToShow, setWalletToShow] = useState('')
  const injectedProvider = selectProvider(config)

  const walletConnectProvider = new WalletConnectProvider({
    rpc: rpcForWalletConnect(config),
  })

  const handleInjectProvider = () => {
    authenticate(injectedProvider)
  }

  const handleUnlockProvider = (provider: any) => {
    authenticate(provider)
  }

  const handleWalletConnectProvider = async () => {
    authenticate(walletConnectProvider)
  }

  return (
    <Container>
      {!walletToShow && (
        <>
          <SubHeading>Connect a wallet</SubHeading>
          <Description>
            Unlock is a protocol built on Ethereum.{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://ethereum.org/en/wallets/"
            >
              Learn more about wallets
            </a>
            .{' '}
          </Description>

          {details && <Description>{details}</Description>}

          <WalletButton
            disabled={!injectedProvider}
            onClick={handleInjectProvider}
          >
            Authenticate with your browser wallet
          </WalletButton>

          <WalletButton onClick={handleWalletConnectProvider}>
            Wallet connect
          </WalletButton>

          <WalletButton
            disabled={!unlockUserAccount}
            onClick={() => {
              setWalletToShow('unlock')
            }}
          >
            Unlock Account
          </WalletButton>
        </>
      )}

      {walletToShow == 'unlock' && unlockUserAccount && (
        <LogInSignUp
          network={1} // default to mainnet?
          embedded={embedded}
          onCancel={onCancel}
          login
          onProvider={handleUnlockProvider}
        />
      )}
    </Container>
  )
}

LoginPrompt.defaultProps = {
  details: '',
}

const SubHeading = styled.h2`
  margin-bottom: 10px;
  font-family: 'IBM Plex Serif', serif;
  font-size: 32px;
  line-height: 42px;
  font-weight: 300;
  color: var(--darkgrey);
`

const Description = styled.p`
  font-family: 'IBM Plex Serif', serif;
  font-weight: 300;
  font-size: 16px;
  color: var(--darkgrey);
  margin: 5px;
`
const WalletButton = styled(ActionButton).attrs({
  color: 'var(--white)',
  activeColor: 'var(--white)',
  fontColor: 'var(--green)',
  fontActiveColor: 'var(--activegreen)',
})`
  margin: 10px 0px;
`

const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 400px;
  display: flex;
  flex-direction: column;
`

LoginPrompt.defaultProps = {
  unlockUserAccount: false,
  onCancel: null,
  embedded: false,
}

export default LoginPrompt
