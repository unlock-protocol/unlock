import React from 'react'
import styled from 'styled-components'
import Jazzicon from 'react-jazzicon'

import UnlockPropTypes from '../../propTypes'
import { ETHEREUM_NETWORKS_NAMES } from '../../constants'

import Media, { NoPhone } from '../../theme/media'
import Buttons from '../interface/buttons/lock'
import Balance from '../helpers/Balance'

export function CreatorAccount({ account, network }) {
  const networkName = ETHEREUM_NETWORKS_NAMES[network.name]
    ? ETHEREUM_NETWORKS_NAMES[network.name][0]
    : 'Unknown Network'
  // Using https://github.com/MetaMask/metamask-extension/blob/develop/ui/lib/icon-factory.js#L60 to make sure jazzicons are consistent between Metamask and unlock.
  const iconSeed = parseInt(account.address.slice(2, 10), 16)
  // this is a toggle. The buttons below (upload / etherscan / download / export)
  // are disabled because they don't do anything yet. When we are ready to enable them
  // set this toggle to true
  const enableTheseButtons = false

  return (
    <Account>
      <AccountHead>
        <h2>Account</h2>
        <NetworkInfo>{networkName}</NetworkInfo>
      </AccountHead>

      <AccountDetails>
        <DoubleHeightCell>
          <Jazzicon diameter={40} seed={iconSeed} />
        </DoubleHeightCell>
        <Label>Address</Label>
        <Label>Balance</Label>
        <Label>Earning</Label>
        {/* reinstate upload / etherscan / download / export functionality when we're ready  */
          enableTheseButtons ? (
          <>
            <DoubleHeightCell>
              <NoPhone>
                <Buttons.Upload />
              </NoPhone>
            </DoubleHeightCell>
            <DoubleHeightCell>
              <NoPhone>
                <Buttons.Etherscan />
              </NoPhone>
            </DoubleHeightCell>
            <DoubleHeightCell>
              <NoPhone>
                <Buttons.Download />
              </NoPhone>
            </DoubleHeightCell>
            <DoubleHeightCell>
              <NoPhone>
                <Buttons.ExportLock />
              </NoPhone>
            </DoubleHeightCell>
          </>
          ) : (
          <>
            <DoubleHeightCell />
            <DoubleHeightCell />
            <DoubleHeightCell />
            <DoubleHeightCell />
          </>
          )}
        {' '}
        {/* eslint-disable-line */
        /* prettier formats this as 12 spaces, eslint wants 10 :/ */}
        <Address>{account.address}</Address>
        <Value>
          <Balance amount={account.balance} convertCurrency={false} />
        </Value>
        <Value>0.00</Value>
      </AccountDetails>
    </Account>
  )
}

CreatorAccount.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
}

export default CreatorAccount

const Account = styled.section``
const AccountHead = styled.header`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  align-items: center;
  grid-gap: 8px;
`

const NetworkInfo = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--red);
`

const AccountDetails = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  display: grid;
  row-gap: 8px;
  column-gap: 16px;
  grid-template-columns: 40px 200px repeat(2, 100px) repeat(3, 24px) 1fr;
  ${Media.phone`
    column-gap: 2px;
    grid-template-columns: 45px 145px repeat(2, 80px);
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
const Address = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  width: 128px;
  font-weight: 300;
  word-wrap: break-word;
  word-break: break-all;
`
const Value = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--darkgrey);
`
