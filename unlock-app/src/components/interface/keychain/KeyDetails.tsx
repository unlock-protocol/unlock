import React, { useContext } from 'react'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import Key from './Key'
import { ImageBar } from '../locks/Manage/elements/ImageBar'
import { useKeys } from '~/hooks/useKeys'
import { Placeholder } from '@unlock-protocol/ui'

export const KeyDetails = () => {
  const { account } = useContext(AuthenticationContext)
  const { keys, isKeysLoading } = useKeys({
    owner: account,
  })

  if (!keys?.length && !isKeysLoading) {
    return (
      <ImageBar
        description="You don't have any keys yet"
        src="/images/illustrations/img-error.svg"
      />
    )
  }

  return (
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
        keys?.map((item) => (
          <Key
            key={item.id}
            ownedKey={item}
            account={account!}
            network={item.network}
          />
        ))}
    </div>
  )
}

export default KeyDetails
