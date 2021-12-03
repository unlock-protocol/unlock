import React, { useContext } from 'react'
import styled from 'styled-components'
import Jazzicon from 'react-jazzicon'

import Address from './Address'
import Media from '../../theme/media'

import { AuthenticationContext } from '../../contexts/AuthenticationContext'

import { ConfigContext } from '../../utils/withConfig'

interface NetworkType {
  name: string
  id: number
}
interface NetworkProps {
  network: NetworkType
}

export const Network = ({ network }: NetworkProps) => {
  return <option value={network.id}>{network.name}</option>
}

export function Account() {
  const { networks } = useContext(ConfigContext)
  const { account, network, deAuthenticate, changeNetwork } = useContext(
    AuthenticationContext
  )

  // Using https://github.com/MetaMask/metamask-extension/blob/develop/ui/lib/icon-factory.js#L60 to make sure jazzicons are consistent between Metamask and unlock.
  const iconSeed = parseInt((account || '0x0000').slice(2, 10), 16)

  const networkSelected = (event: any) => {
    changeNetwork(networks[event?.target?.value])
  }

  return (
    <AccountWrapper>
      <AccountDetails>
        <DoubleHeightCell disabled={!account}>
          <UserIcon seed={iconSeed} />
        </DoubleHeightCell>
        <Label>
          <NetworkInfo title="To change network, switch in your wallet of choice and refresh the page">
            {!network && <p>Not connected</p>}
            {network && (
              <NetworkSelect onChange={networkSelected} value={network}>
                {Object.keys(networks).map((networkId) => {
                  return (
                    <Network network={networks[networkId]} key={networkId} />
                  )
                })}
              </NetworkSelect>
            )}
            {network && (
              <DisconnectButton type="button" onClick={deAuthenticate}>
                Disconnect
              </DisconnectButton>
            )}
          </NetworkInfo>
        </Label>
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <UserAddress id="UserAddress" address={account} />
      </AccountDetails>
    </AccountWrapper>
  )
}

const NetworkSelect = styled.select`
  cursor: pointer;
  border: none;
  border-radius: 3px;
  background-color: transparent;
  color: rgb(106, 106, 106);

  /* height: 48px;
  width: 100%;
  border: thin var(--lightgrey) solid;
  border-radius: 4px;
  background-color: var(--lightgrey);
  font-size: 16px;
  padding: 0 8px;
  color: var(--darkgrey);
  margin-bottom: 16px;
  appearance: none; */
`

const DisconnectButton = styled.button`
  cursor: pointer;
  border: 1px solid var(--grey);
  border-radius: 3px;
  background-color: transparent;
  color: rgb(106, 106, 106);
`

const UserIcon = styled(Jazzicon).attrs({
  diameter: 40,
})``

export default Account
const NetworkInfo = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--red);
  text-transform: none;
`

const AccountWrapper = styled.section``
const AccountDetails = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  display: grid;
  row-gap: 8px;
  column-gap: 16px;
  grid-template-columns: 40px 200px repeat(2, 100px) repeat(3, 24px) 1fr;
  ${Media.phone`
    column-gap: 2px;
    grid-template-columns: 45px 145px repeat(2, 0px);
  `};
`

interface DoubleHeightCellProps {
  disabled?: boolean
}

const DoubleHeightCell = styled.div<DoubleHeightCellProps>`
  display: grid;
  height: 40px;
  grid-row: span 2;
  align-self: start;
  font-size: 24px;
  align-content: start;
  ${Media.phone`
    height: 0px;
  `};
  ${({ disabled }) => disabled && 'filter: grayscale(1); opacity: 0.3'}
`

const Label = styled.div`
  font-weight: 100;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 8px;
`

const UserAddress = styled(Address)`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  width: 128px;
  font-weight: 300;
  word-wrap: break-word;
  word-break: break-all;
`
