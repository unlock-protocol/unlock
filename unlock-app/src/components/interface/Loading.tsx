import React from 'react'
import { AiOutlineLoading3Quarters as LoadingIcon } from 'react-icons/ai'

interface Props {
  size?: number
}

const Loading = ({ size = 40 }: Props) => {
  return (
    <div className="flex justify-center">
      <LoadingIcon
        size={size}
        title="loading"
        className="text-gray-400 animate-spin"
      />
    </div>
  )
}

export default Loading
