import React from 'react'

interface Props {
  locked: boolean
  children: React.ReactNode
}

export default function ShowWhenUnlocked({
  locked = false,
  children = null,
}: Props) {
  if (locked) {
    return null
  }

  return <React.Fragment>{children}</React.Fragment>
}
