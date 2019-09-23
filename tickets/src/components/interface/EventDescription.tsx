import React from 'react'
import { DescriptionPara, DescriptionWrapper } from './EventStyles'

export const EventDescription = ({ body }: { body: string }) => {
  return (
    <DescriptionWrapper>
      {body.split('\n\n').map(line => {
        return <DescriptionPara key={line}>{line}</DescriptionPara>
      })}
    </DescriptionWrapper>
  )
}

export default EventDescription
