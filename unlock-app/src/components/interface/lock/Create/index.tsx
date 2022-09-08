import React from 'react'
import { BsArrowLeft as ArrowBack } from 'react-icons/bs'
import { CreateLockForm } from './CreateLockForm'

export const CreateLockPage = () => {
  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <div className="mx-auto lg:container pt-9">
        <div className="grid items-center grid-cols-3">
          <ArrowBack size={20} className="cursor-pointer" />
          <h1 className="text-xl font-semibold text-center">Creating Lock</h1>
        </div>
        <div className="grid grid-cols-2 gap-28 pt-14">
          <div className="flex flex-col max-w-lg mx-auto">
            <h4 className="mb-4 text-5xl font-bold">
              Connect with your 1000 true fans
            </h4>
            <span className="text-lg font-normal">
              For creative communities and the humans who build them
            </span>
            <img className="mt-9" src="/images/svg/members.svg" alt="" />
          </div>
          <div className="max-w-lg">
            <CreateLockForm />
          </div>
        </div>
      </div>
    </div>
  )
}
