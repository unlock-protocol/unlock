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
        <div className="col-auto">
          {account && iconSeed && <UserIcon seed={iconSeed} />}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs break-words word-wrap">
            {account && addressMinify(account)}
          </div>
          <span className="text-base uppercase ">
            {network && (
              <div className="flex items-start gap-2 space-y-2">
                <div className="w-96">
                  <Select
                    options={networkOptions}
                    label={''}
                    defaultValue={network}
                    onChange={onNetworkChange}
                  />
                </div>

                <Button
                  type="button"
                  size="small"
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
          </span>
        </div>
      </div>
    </div>
  )
}

const UserIcon = styled(Jazzicon).attrs({
  diameter: 40,
})``

export default Account
