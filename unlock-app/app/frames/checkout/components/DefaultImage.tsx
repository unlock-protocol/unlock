import React from 'react'
import { Lock } from '../frames'

interface DefaultImageProps {
  lock: Lock
  rightSideContent?: any
}

export function DefaultImage({ lock, rightSideContent }: DefaultImageProps) {
  const { image, name, description, price } = lock

  const defaultRightSideContent = (
    <div tw="flex-1 flex flex-col ml-4 justify-center">
      <p tw="text-6xl">{name}</p>
      <p>{description}</p>
      <p>{price}</p>
    </div>
  )

  // //svg images are not rendered
  const isSvg = /\/icon\/?$/.test(image)
  const leftImage = isSvg ? (
    <div tw="flex-1 h-full flex justify-center items-center border-4 border-white rounded-lg bg-gray-300">
      <p>{name} image</p>
    </div>
  ) : (
    <img src={image} tw="flex-1 min-h-full border-4 border-white rounded-lg" />
  )

  return (
    <div tw="flex w-full h-full bg-gray-200 p-2">
      {leftImage}
      {rightSideContent || defaultRightSideContent}
    </div>
  )
}
