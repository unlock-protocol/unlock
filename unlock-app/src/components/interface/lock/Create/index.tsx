import React, { useState } from 'react'
import { BsArrowLeft as ArrowBack } from 'react-icons/bs'
import { CreateLockSteps, Step } from './CreateLock'

const TITLE_BY_STATUS_MAPPING: Record<Step, string> = {
  data: 'Creating Lock',
  summary: 'Creating Lock',
  deploy: 'Deploying Lock',
}

export const CreateLockPage = () => {
  const [step, setStep] = useState<Step>('data')

  const title = TITLE_BY_STATUS_MAPPING[step]
  return (
    <div className="min-w-full min-h-screen bg-ui-secondary-200">
      <div className="px-4 mx-auto lg:container pt-9">
        <div className="grid items-center grid-cols-3">
          <ArrowBack size={20} className="cursor-pointer" />
          <h1 className="text-xl font-semibold text-center">{title}</h1>
        </div>
        <div className="pt-14">
          <CreateLockSteps onStepChange={setStep} />
        </div>
      </div>
    </div>
  )
}
