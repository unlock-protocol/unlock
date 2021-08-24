import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ConfigContext } from '../../utils/withConfig'
import SvgComponents from './svg'

import { AuthenticationContext } from './Authenticate'
import { ActionButton } from './buttons/ActionButton'
import LogInSignUp from './LogInSignUp'

interface LoginPromptProps {
  unlockUserAccount?: boolean
  onCancel?: () => void
  embedded?: boolean
  children?: React.ReactNode
  showTitle?: boolean
  backgroundColor?: string
  activeColor?: string
  injectedProvider?: any
  onProvider?: (provider: any) => void
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
  children,
  unlockUserAccount,
  onCancel,
  embedded,
  showTitle,
  backgroundColor,
  injectedProvider,
  activeColor,
  onProvider,
}: LoginPromptProps) => {
  const config = useContext(ConfigContext)
  const { authenticate } = useContext(AuthenticationContext)
  const [walletToShow, setWalletToShow] = useState('')

  const walletConnectProvider = new WalletConnectProvider({
    rpc: rpcForWalletConnect(config),
  })

  const injectedOrDefaultProvider = injectedProvider || selectProvider(config)

  const authenticateIfNotHandled = async (provider: any) => {
    if (onProvider) {
      await onProvider(provider)
    } else {
      await authenticate(provider)
    }
  }

  const handleInjectProvider = async () => {
    await authenticateIfNotHandled(injectedOrDefaultProvider)
  }

  const handleUnlockProvider = async (provider: any) => {
    await authenticateIfNotHandled(provider)
  }

  const handleWalletConnectProvider = async () => {
    await authenticateIfNotHandled(walletConnectProvider)
  }

  return (
    <Container embedded={!!embedded}>
      {!walletToShow && (
        <>
          {showTitle && <SubHeading>Connect a wallet</SubHeading>}

          {children && <Description>{children}</Description>}

          <WalletButton
            color={backgroundColor}
            activeColor={activeColor}
            disabled={!injectedOrDefaultProvider}
            onClick={handleInjectProvider}
          >
            <SvgComponents.Metamask />
            In browser wallet
          </WalletButton>

          <WalletButton
            color={backgroundColor}
            activeColor={activeColor}
            onClick={handleWalletConnectProvider}
          >
            <SvgComponents.WalletConnect fill="var(--blue)" />
            WalletConnect
          </WalletButton>

          {unlockUserAccount && (
            <WalletButton
              color={backgroundColor}
              activeColor={activeColor}
              disabled={!unlockUserAccount}
              onClick={() => {
                setWalletToShow('unlock')
              }}
            >
              <SvgComponents.Unlock fill="var(--brand)" />
              Unlock Account
            </WalletButton>
          )}
        </>
      )}

      {walletToShow == 'unlock' && unlockUserAccount && (
        <LogInSignUp
          network={1} // default to mainnet?
          embedded={embedded}
          onCancel={onCancel}
          login
          onProvider={handleUnlockProvider}
          useWallet={() => setWalletToShow('')}
        />
      )}
    </Container>
  )
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
  fontColor: 'var(--dimgrey)',
  fontActiveColor: 'var(--dimgrey)',
  borderColor: 'transparent',
  activeBorderColor: 'transparent',
})`
  margin: 10px 0px;

  display: flex;
  text-align: left;
  margin: 10px 0px;
  align-items: center;

  a,
  a:hover,
  a:visited,
  a:active {
    color: inherit !important;
  }

  svg {
    margin-right: 10px;
    width: 32px;
    height: 32px;
  }
`

interface ContainerProps {
  embedded?: boolean
}

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  width: ${({ embedded }) => (!embedded ? '400px' : '')};
  justify-self: center;
`

LoginPrompt.defaultProps = {
  unlockUserAccount: false,
  onCancel: null,
  embedded: false,
  children: null,
  showTitle: true,
  backgroundColor: 'var(--offwhite)',
  activeColor: 'var(--white)',
  injectedProvider: null,
  onProvider: null,
}

export default LoginPrompt
