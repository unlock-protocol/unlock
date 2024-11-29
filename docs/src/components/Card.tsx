import { Button } from '@unlock-protocol/ui'
import React from 'react'

interface CardProps {
  title: string
  description: string
  action: {
    title: string
    url: string
  }
}

export default function Card({ title, description, action }: CardProps) {
  return (
    <div
      className="bg-white rounded-2xl space-y-4 p-4"
      style={{ marginBottom: '1.5rem' }}
    >
      <div className="">
        <h3 className="text-center">{title}</h3>
      </div>
      <div className="p-4">
        <p className="text-left">{description}</p>
      </div>
      <div className="">
        <a href={action.url} className="block w-full">
          <Button className="w-full">{action.title}</Button>
        </a>
      </div>
    </div>
  )
}
