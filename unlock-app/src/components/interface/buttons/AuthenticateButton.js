import styled from 'styled-components'
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ActionButton } from './ActionButton'
import { rpcForWalletConnect, selectProvider } from '../LoginPrompt'
import { ConfigContext } from '../../../utils/withConfig'
import Svg from '../svg'

const AuthenticateButton = ({
  web3Provider,
  showAccount,
  onProvider,
  login,
}) => {
  const config = useContext(ConfigContext)

  const authenticateWithProvider = () => {
    onProvider(web3Provider)
  }

  const authenticateWithWalletConnect = () => {
    const walletConnectProvider = new WalletConnectProvider({
      rpc: rpcForWalletConnect(config),
    })
    onProvider(walletConnectProvider)
  }

  return (
    <Container>
      <Button disabled={!web3Provider} onClick={authenticateWithProvider}>
        Wallet
      </Button>
      <WalletConnectButton onClick={authenticateWithWalletConnect}>
        <Svg.WalletConnect width="26" fill="white" />
      </WalletConnectButton>
      {showAccount && (
        <Button disabled={!showAccount || web3Provider} onClick={login}>
          Sign-in
        </Button>
      )}
    </Container>
  )
}

AuthenticateButton.propTypes = {
  web3Provider: PropTypes.func.isRequired,
  showAccount: PropTypes.bool.isRequired,
  onProvider: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
}

const Container = styled.div`
  display: flex;
  flex-direction: horizontal;
`

const Button = styled(ActionButton)`
  margin: 5px;
  height: 40px;
`

const WalletConnectButton = styled(Button)`
  display: grid;
  padding-left: 5px;
  padding-right: 5px;
  align-items: center;
  justify-items: center;
`
export default AuthenticateButton
