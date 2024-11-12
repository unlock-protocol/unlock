import React from 'react'
import { Metadata } from 'next'
import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'There was an error with your authentication. Please try again.',
}

const AuthErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-10">
      <>
        <h1 className="text-4xl font-bold text-center">Authentication Error</h1>
        <ImageBar
          description="There was an error with your authentication. Please try again."
          src="/images/illustrations/img-error.svg"
        />
      </>
    </div>
  )
}

export default AuthErrorPage
