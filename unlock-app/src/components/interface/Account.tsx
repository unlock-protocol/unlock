import React, { useContext } from 'react'
import styled from 'styled-components'
import Jazzicon from 'react-jazzicon'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { ConfigContext } from '../../utils/withConfig'
import { useStorageService } from '~/utils/withStorageService'
import { Select, Button } from '@unlock-protocol/ui'
import { addressMinify } from '~/utils/strings'
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

  const onNetworkChange = (id: string | number) => {
    changeNetwork(networks?.[parseInt(`${id}`)!])
  }

  const networkOptions = Object.keys(networks).map((networkId) => {
    const { id, name } = networks[networkId] ?? {}
    return {
      value: id,
      label: name,
    }
  })

  return (
    <div>
      <div className="flex items-end gap-3 md:flex-row">
        <div className="hidden col-auto md:block">
          {account && iconSeed && <UserIcon seed={iconSeed} />}
        </div>
        <div className="flex flex-col w-full gap-2">
          {network && (
            <div className="flex flex-col items-end w-full gap-2 md:flex-row">
              <div className="w-full md:w-96">
                <Select
                  options={networkOptions}
                  label={account && addressMinify(account)}
                  defaultValue={network}
                  onChange={onNetworkChange}
                  size="small"
                />
              </div>

              <Button
                type="button"
                size="tiny"
                variant="outlined-primary"
                onClick={() => {
                  deAuthenticate()
                  storageService.signOut()
                }}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const UserIcon = styled(Jazzicon).attrs({
  diameter: 40,
})``

export default Account
