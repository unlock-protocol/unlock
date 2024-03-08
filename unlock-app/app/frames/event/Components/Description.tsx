import React from 'react'

interface Props {
  name: string
  startTime?: string
  location?: string
  iconURL?: string
  bannerURL?: string
}

export const DefaultImage = ({
  name,
  startTime,
  location,
  iconURL,
  bannerURL,
}: Props) => {
  return (
    <div tw="flex flex-col bg-[#F5F5F5] h-full w-full">
      <div tw="relative flex flex-col w-full h-80">
        {iconURL && (
          <img
            width="64"
            height="64"
            src={iconURL}
            tw="w-64 h-64 top-16 left-12 rounded-xl border-4 shadow-xl border-white"
            aria-label={name}
          />
        )}
      </div>
      <div tw="flex items-center justify-between w-full px-12">
        <p>Description!</p>
      </div>
    </div>
  )
}
