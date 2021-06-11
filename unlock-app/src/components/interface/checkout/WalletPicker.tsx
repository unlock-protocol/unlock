import React, { useContext } from 'react'
import { ethers } from 'ethers'
import styled from 'styled-components'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ConfigContext } from '../../../utils/withConfig'

import { ActionButton } from '../buttons/ActionButton'
import SvgComponents from '../svg'

interface WalletPickerProps {
  onProvider: (provider: any) => void
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

const WalletPicker = ({ onProvider }: WalletPickerProps) => {
  const config = useContext(ConfigContext)
  const injectedProvider = selectProvider(config)

  const walletConnectProvider = new WalletConnectProvider({
    rpc: rpcForWalletConnect(config),
  })

  const handleInjectProvider = async () => {
    if (injectedProvider.enable) {
      try {
        await injectedProvider.enable()
      } catch {
        alert('PLEASE ENABLE PROVIDER!')
      }
    }

    onProvider(new ethers.providers.Web3Provider(injectedProvider))
  }

  const handleWalletConnectProvider = async () => {
    await walletConnectProvider.enable()
    onProvider(new ethers.providers.Web3Provider(walletConnectProvider))
  }

  return (
    <Container>
      <p>Select your crypto wallet of choice</p>
      <WalletButton disabled={!injectedProvider} onClick={handleInjectProvider}>
        <SvgComponents.Metamask />
        Metamask
      </WalletButton>

      <WalletButton onClick={handleWalletConnectProvider}>
        <SvgComponents.WalletConnect />
        WalletConnect
      </WalletButton>
    </Container>
  )
}

WalletPicker.defaultProps = {}

const WalletButton = styled(ActionButton).attrs({
  color: 'var(--white)',
  activeColor: 'var(--white)',
  fontColor: 'var(--dimgrey)',
  fontActiveColor: 'var(--dimgrey)',
  borderColor: 'transparent',
  activeBorderColor: 'transparent',
})`
  display: flex;
  text-align: left;
  margin: 10px 0px;
  align-items: center;

  svg {
    margin-right: 10px;
    width: 32px;
    height: 32px;
    fill: var(--blue);
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

WalletPicker.defaultProps = {}

export default WalletPicker
