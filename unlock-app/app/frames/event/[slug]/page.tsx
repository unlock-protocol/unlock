import { storage } from '../../../../src/config/storage'
import React from 'react'
import { useFramesReducer, getPreviousFrame } from 'frames.js/next/server'
import DefaultFrame from '../Components/DefaultFrame'
import Description from '../Components/Description'
import Rsvp, { getNextEmptyField } from '../Components/Rsvp'

const reducer = (state: any, action: any) => {
  if (action.prevState.view === 'default') {
    if (action.postBody.untrustedData.buttonIndex === 2) {
      return { view: 'rsvp', metadata: {} }
    }
    return { view: 'description' }
  } else if (action.prevState.view === 'description') {
    if (action.postBody.untrustedData.buttonIndex === 2) {
      return { view: 'rsvp', metadata: {} }
    }
    return { view: 'default' }
  } else if (action.prevState.view === 'rsvp') {
    if (action.postBody.untrustedData.buttonIndex === 1) {
      return { ...state, inputValue: action.postBody.untrustedData.inputText }
    }
    return { view: 'default' }
  }
  return { ...state }
}

interface SearchParams {
  [key: string]: string | string[] | undefined
}

interface HomeProps {
  params: { slug: string }
  searchParams: SearchParams
}

export default async function Frame(props: HomeProps) {
  const slug = props.params.slug
  const previousFrame = getPreviousFrame(props.searchParams)
  // await validateActionSignature(previousFrame.postBody)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state] = useFramesReducer(reducer, { view: 'default' }, previousFrame)

  const { data: event } = await storage.getEvent(slug)
  if (!event?.data) {
    return new Response('Event not found', { status: 404 })
  }

  // if (hasPassed) {
  //   // No need to add a button for RSVP!
  // } else if (event.requiresApproval) {
  //   frameMeta.push(
  //     {
  //       name: 'fc:frame:button:2',
  //       content: 'Apply',
  //     },
  //     {
  //       name: 'fc:frame:button:2:action',
  //       content: 'post',
  //     }
  //   )
  // } else {
  //   frameMeta.push(
  //     {
  //       name: 'fc:frame:button:2',
  //       content: 'Register',
  //     },
  //     {
  //       name: 'fc:frame:button:2:target',
  //       content: eventUrl,
  //     },
  //     {
  //       name: 'fc:frame:button:2:action',
  //       content: 'link',
  //     }
  //   )
  // }

  if (state.view === 'description') {
    return (
      <Description state={state} previousFrame={previousFrame} event={event} />
    )
  }

  if (state.view === 'rsvp') {
    return <Rsvp state={state} previousFrame={previousFrame} event={event} />
  }
  return (
    <DefaultFrame state={state} previousFrame={previousFrame} event={event} />
  )
}
