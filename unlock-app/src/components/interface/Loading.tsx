import React from 'react'
import { CgSpinner as SpinnerIcon } from 'react-icons/cg'

interface Props {
  size?: number
}

export const LoadingIcon = ({ size = 40 }: Props) => {
  return (
    <div className="flex justify-center">
      <SpinnerIcon
        size={size}
        title="loading"
        className="text-gray-400 animate-spin"
      />
    </div>
  )
}

export default LoadingIcon
