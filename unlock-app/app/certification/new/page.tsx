import { AuthRequired } from 'app/Components/ProtectedContent'
import { Metadata } from 'next'
import React from 'react'
import NewCertificationContent from '~/components/content/certification/NewCertification'

export const metadata: Metadata = {
  title: 'Create a New Certification',
  description:
    'Create a new certification in under five minutes with Unlock Protocol',
}

const NewCertificationPage: React.FC = () => {
  return (
    <AuthRequired>
      <NewCertificationContent />
    </AuthRequired>
  )
}

export default NewCertificationPage
