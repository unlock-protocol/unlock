import React from 'react'
import { Lock } from '../frames'
import { truncateString } from '~/utils/truncateString'
import removeMd from 'remove-markdown'

interface DefaultImageProps {
  lock: Lock
  rightSideContent?: any
}

export function DefaultImage({ lock, rightSideContent }: DefaultImageProps) {
  const { image, defaultImage, price, name, description } = lock

  const defaultRightSideContent = (
    <div tw="flex flex-col">
      <div tw="flex flex-col">
        <p tw="m-0 p-0 text-6xl overflow-hidden mb-4 max-h-40">
          {truncateString(name, 34)}
        </p>
        <p tw="m-0 p-0 text-2xl mb-4 overflow-hidden">
          {truncateString(removeMd(description, { useImgAltText: false }), 450)}
        </p>
      </div>
      <p tw="m-0 p-0 text-3xl">🏷️ {price}</p>
    </div>
  )
  const leftImage = (
    <img
      alt="Membership"
      src={defaultImage ? defaultImage : image}
      tw="min-h-full border-4 border-white rounded-lg"
    />
  )

  return (
    <div tw="flex w-full h-full bg-gray-200 p-2">
      <div tw="flex w-1/2">{leftImage}</div>
      <div tw="flex flex-col w-1/2 pl-2">
        {rightSideContent || defaultRightSideContent}
      </div>
    </div>
  )
}
