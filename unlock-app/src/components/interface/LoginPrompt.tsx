import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import SvgComponents from './svg'

import { ActionButton } from './buttons/ActionButton'
import LogInSignUp from './LogInSignUp'
import { useAuthenticate } from '../../hooks/useAuthenticate'
import {
  useAuthenticateHandler,
  WalletProvider,
} from '../../hooks/useAuthenticateHandler'

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
  onAutoLogin?: (promise: Promise<any>) => any
}

export interface EthereumWindow extends Window {
  ethereum?: any
  web3?: any
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
  const [walletToShow, setWalletToShow] = useState('')

  const { injectedOrDefaultProvider } = useAuthenticate({ injectedProvider })
  const { getProviderHandler } = useAuthenticateHandler({
    onProvider,
    injectedProvider,
  })
  const loginWithProvider = useCallback(async (key: WalletProvider) => {
    await getProviderHandler(key)
  }, [])

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
            onClick={() => loginWithProvider('METAMASK')}
          >
            <SvgComponents.Metamask />
            In browser wallet
          </WalletButton>

          <WalletButton
            color={backgroundColor}
            activeColor={activeColor}
            onClick={() => loginWithProvider('WALLET_CONNECT')}
          >
            <SvgComponents.WalletConnect fill="var(--blue)" />
            WalletConnect
          </WalletButton>

          <WalletButton
            color={backgroundColor}
            activeColor={activeColor}
            onClick={() => loginWithProvider('COINBASE')}
          >
            <SvgComponents.CoinbaseWallet fill="var(--blue)" />
            Coinbase Wallet
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
          onProvider={() => loginWithProvider('UNLOCK')}
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
