import React from 'react'
import Key from './Key'
import { ImageBar } from '../locks/Manage/elements/ImageBar'
import { useKeys } from '~/hooks/useKeys'
import { minifyAddress, Placeholder } from '@unlock-protocol/ui'
import networks from '@unlock-protocol/networks'
import { NetworkConfig } from '@unlock-protocol/types'
import { useAuthenticate } from '~/hooks/useAuthenticate'

export const KeyDetails = ({ owner }: { owner: string }) => {
  const { account } = useAuthenticate()
  const { keys, isKeysLoading } = useKeys({
    owner,
    networks: Object.values(networks)
      .filter((item: NetworkConfig) => !item.isTestNetwork || owner === account)
      .map((item: NetworkConfig) => item.id),
  })

  if (!keys?.length && !isKeysLoading) {
    return (
      <ImageBar
        description={`The address ${minifyAddress(
          owner
        )} does not have any key yet`}
        src="/images/illustrations/img-error.svg"
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-6 pb-16 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {isKeysLoading &&
          Array.from({ length: 10 }).map((_, index) => (
            <Placeholder.Root
              className="grid items-center justify-center gap-2 p-4 bg-white border border-gray-200 shadow-lg rounded-xl"
              key={index}
            >
              <Placeholder.Line />
              <Placeholder.Image className="w-[300px] h-[300px]" />
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Root>
          ))}
        {!isKeysLoading &&
          keys?.map((item: any) => (
            <Key
              key={item.id}
              ownedKey={item}
              owner={owner!}
              network={item.network}
            />
          ))}
      </div>
    </div>
  )
}

export default KeyDetails
