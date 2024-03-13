import React from 'react'
import { FrameContainer } from 'frames.js/next/server'
import { config } from '../../../../src/config/app'

export const Container = ({
  slug,
  previousFrame,
  children,
  state,
}: {
  state: any
  slug: string
  previousFrame: any
  children: React.ReactNode
}) => {
  return (
    <FrameContainer
      pathname={`${config.unlockApp}/frames/event/${slug}`}
      postUrl={`${config.unlockApp}/frames/event`}
      state={state}
      previousFrame={previousFrame}
    >
      {/* @ts-expect-error Type 'ReactNode' is not assignable to type 'ChildType | (ChildType | null)[]'. */}
      {children}
    </FrameContainer>
  )
}

export default Container
