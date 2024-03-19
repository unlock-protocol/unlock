import React from 'react'
import Container from './Container'
import { FrameButton, FrameImage, FrameInput } from 'frames.js/next/server'
import { MetadataInputType } from '@unlock-protocol/core'
import { storage } from '~/config/storage'

export const getNextEmptyField = (event: any, metadata: any) => {
  const lockAddress = Object.keys(event.checkoutConfig.config.locks)[0]

  let missingField: MetadataInputType | undefined
  event.checkoutConfig.config.locks[lockAddress].metadataInputs.forEach(
    (field: MetadataInputType) => {
      if (!metadata[field.name]) {
        missingField = field
      }
    }
  )
  return missingField
}

export const Rsvp = ({
  event,
  previousFrame,
  state,
}: {
  event: any
  previousFrame: any
  state: any
}) => {
  if (state.inputValue) {
    const field = getNextEmptyField(event, state.metadata)!
    state.metadata[field.name] = state.inputValue
    delete state.inputValue
  }
  // ok let's now get the fields required!
  const missingField = getNextEmptyField(event, state.metadata)

  if (missingField) {
    return (
      <Container slug={event.slug} previousFrame={previousFrame} state={state}>
        <FrameImage>
          <p tw="px-4">Please enter your {missingField.label}</p>
        </FrameImage>
        <FrameInput text={missingField.placeholder || ''} />
        <FrameButton>Submit</FrameButton>
      </Container>
    )
  }

  // We should sumit!!
  console.log('SUBMIT', state.metadata, event)
  // const response = await storage.rsvp(network, lockAddress, captcha, {
  //   recipient,
  //   data,
  //   email,
  // })

  return (
    <Container slug={event.slug} previousFrame={previousFrame} state={state}>
      <FrameImage>
        <p tw="px-4">Are you ready to submit the following?</p>
        <ul></ul>
      </FrameImage>
      <FrameButton>Submit</FrameButton>
    </Container>
  )
}

export default Rsvp
