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
      className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 rounded-2xl space-y-4 p-4"
      style={{ marginBottom: '1.5rem' }}
    >
      <div>
        <h3 className="text-center text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      <div className="p-4">
        <p className="text-left text-gray-800 dark:text-gray-200">
          {description}
        </p>
      </div>
      <div>
        <a href={action.url} className="block w-full">
          <Button className="w-full">{action.title}</Button>
        </a>
      </div>
    </div>
  )
}
