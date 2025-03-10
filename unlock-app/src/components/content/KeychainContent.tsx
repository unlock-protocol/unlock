'use client'

import { useSearchParams } from 'next/navigation'
import KeyDetails from '../interface/keychain/KeyDetails'
import networks from '@unlock-protocol/networks'
import OwnerSocials from '../interface/keychain/OwnerSocials'
import { Tooltip } from '@unlock-protocol/ui'
import { TbWorld as WorldIcon } from 'react-icons/tb'
import { OpenSeaIcon } from '../icons'
import { WalletNotConnected } from '../interface/layouts/index/WalletNotConnected'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { LoadingIcon } from '../interface/Loading'

export const KeychainContent = () => {
  const { account, isLoading } = useAuthenticate()
  const searchParams = useSearchParams()
  const owner = searchParams.get('owner') || account || null

  const networkConfig = networks[1]

  if (isLoading) {
    return <LoadingIcon size={40} />
  }

  if (!owner) {
    return <WalletNotConnected />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-8">
        {owner && <OwnerSocials owner={owner} />}
        {networkConfig && owner && (
          <div className="flex gap-3">
            {networkConfig.blockScan && networkConfig.blockScan.url && (
              <Tooltip tip="Show Blockscan" label="Show Blockscan">
                <a
                  href={networkConfig.blockScan.url(owner)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-ui-primary"
                >
                  <WorldIcon size={25} />
                </a>
              </Tooltip>
            )}

            {networkConfig.opensea && networkConfig.opensea.profileUrl && (
              <Tooltip tip="View Opensea Profile" label="View Opensea Profile">
                <a
                  href={networkConfig.opensea.profileUrl(owner) ?? '#'}
                  rel="noreferrer"
                  target="_blank"
                  className="hover:text-brand-ui-primary"
                >
                  <OpenSeaIcon size={23} />
                </a>
              </Tooltip>
            )}
          </div>
        )}
      </div>
      {owner && <KeyDetails owner={owner} />}
    </div>
  )
}

export default KeychainContent
