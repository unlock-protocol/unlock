import React from 'react'

import SuspendedRender from '../helpers/SuspendedRender'

interface Props {
  locked: boolean
  children: React.ReactNode
}

export default function ShowWhenLocked({
  locked = false,
  children = null,
}: Props) {
  if (!locked) {
    return null
  }

  return <SuspendedRender>{children}</SuspendedRender>
}
