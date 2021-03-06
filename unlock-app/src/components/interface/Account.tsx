import React, { useContext } from 'react'
import styled from 'styled-components'
import Jazzicon from 'react-jazzicon'

import Address from './Address'
import Media from '../../theme/media'
import { AuthenticationContext } from './Authenticate'
import { ConfigContext } from '../../utils/withConfig'

export function Account() {
  const { networks } = useContext(ConfigContext)
  const { account, network } = useContext(AuthenticationContext)
  // Using https://github.com/MetaMask/metamask-extension/blob/develop/ui/lib/icon-factory.js#L60 to make sure jazzicons are consistent between Metamask and unlock.
  const iconSeed = parseInt((account || '').slice(2, 10), 16)
  return (
    <AccountWrapper>
      <AccountDetails>
        <DoubleHeightCell>
          {account && <Jazzicon diameter={40} seed={iconSeed} />}
        </DoubleHeightCell>
        <Label>
          <NetworkInfo>{networks[network].name}</NetworkInfo>
        </Label>
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        <DoubleHeightCell />
        {account && <UserAddress id="UserAddress" address={account} />}
      </AccountDetails>
    </AccountWrapper>
  )
}

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

const DoubleHeightCell = styled.div`
  display: grid;
  height: 40px;
  grid-row: span 2;
  align-self: start;
  font-size: 24px;
  align-content: start;
  ${Media.phone`
    height: 0px;
  `};
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
