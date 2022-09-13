import React from 'react'

import { CreateLockSteps } from './CreateLock'

export const CreateLockPage = () => {
  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <div className="px-4 mx-auto lg:container pt-9">
        <CreateLockSteps />
      </div>
    </div>
  )
}

export default CreateLockPage
