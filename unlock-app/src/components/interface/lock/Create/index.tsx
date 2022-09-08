import React from 'react'
import { BsArrowLeft as ArrowBack } from 'react-icons/bs'
import { CreateLockForm } from './CreateLockForm'

export const CreateLockPage = () => {
  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <div className="px-4 mx-auto lg:container pt-9">
        <div className="grid items-center grid-cols-3">
          <ArrowBack size={20} className="cursor-pointer" />
          <h1 className="text-xl font-semibold text-center">Creating Lock</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-28 pt-14">
          <div className="flex flex-col mx-auto md:max-w-lg">
            <h4 className="mb-4 text-5xl font-bold">
              Connect with your 1000 true fans
            </h4>
            <span className="text-lg font-normal">
              For creative communities and the humans who build them
            </span>
            <img
              className="hidden mt-9 md:block"
              src="/images/svg/members.svg"
              alt=""
            />
          </div>
          <div className="md:max-w-lg">
            <CreateLockForm />
          </div>
        </div>
      </div>
    </div>
  )
}
