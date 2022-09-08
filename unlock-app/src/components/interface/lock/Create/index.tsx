import React from 'react'
import { BsArrowLeft as ArrowBack } from 'react-icons/bs'
import { CreateLockSteps } from './CreateLock'

export const CreateLockPage = () => {
  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <div className="px-4 mx-auto lg:container pt-9">
        <div className="grid items-center grid-cols-3">
          <ArrowBack size={20} className="cursor-pointer" />
          <h1 className="text-xl font-semibold text-center">Creating Lock</h1>
        </div>
        <CreateLockSteps />
      </div>
    </div>
  )
}
