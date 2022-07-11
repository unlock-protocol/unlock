import React, { useContext } from 'react'
import styled from 'styled-components'
import Jazzicon from 'react-jazzicon'
import Media from '../../theme/media'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'

import { ConfigContext } from '../../utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'

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
  const storageService = useStorageService()

  // Using https://github.com/MetaMask/metamask-extension/blob/develop/ui/lib/icon-factory.js#L60 to make sure jazzicons are consistent between Metamask and unlock.
  const iconSeed = parseInt((account || '0x0000').slice(2, 10), 16)

  const networkSelected = (event: any) => {
    changeNetwork(networks[event?.target?.value])
  }

  return (
    <AccountWrapper>
      <AccountDetails className="items-center">
        {iconSeed && <UserIcon seed={iconSeed} />}
        <div className="grid gap-2 w-[155px]">
          <div
            style={{
              wordWrap: 'break-word',
            }}
            className="font-mono text-xs w-[155px] word-wrap"
          >
            {account}
          </div>
          <Label>
            {!network && <p>Not connected</p>}
            {network && (
              <div className="grid space-y-2">
                <select
                  className="px-2 py-1 text-sm text-black bg-white border rounded"
                  onChange={networkSelected}
                  value={network}
                >
                  {Object.keys(networks).map((networkId) => {
                    return (
                      <Network network={networks[networkId]} key={networkId} />
                    )
                  })}
                </select>
                <button
                  className="px-2 py-1 text-gray-900 bg-gray-200 rounded"
                  type="button"
                  onClick={() => {
                    deAuthenticate()
                    storageService.signOut()
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </Label>
        </div>
      </AccountDetails>
    </AccountWrapper>
  )
}

const UserIcon = styled(Jazzicon).attrs({
  diameter: 40,
})``

export default Account

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

const Label = styled.div`
  font-weight: 100;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 8px;
`
