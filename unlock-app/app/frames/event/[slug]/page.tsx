import { locksmith } from '../../../../src/config/locksmith'
import React from 'react'
import { useFramesReducer, getPreviousFrame } from 'frames.js/next/server'
import { DefaultFrame } from '../Components/DefaultFrame'
import { Description } from '../Components/Description'

const reducer = (state: any, action: any) => {
  if (action.prevState.view === 'default') {
    return { view: 'description' }
  }
  if (action.prevState.view === 'description') {
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

  const { data: event } = await locksmith.getEvent(slug)
  if (!event?.data) {
    return new Response('Event not found', { status: 404 })
  }

  if (state.view === 'description') {
    return (
      <Description state={state} previousFrame={previousFrame} event={event} />
    )
  }
  return (
    <DefaultFrame state={state} previousFrame={previousFrame} event={event} />
  )
}
