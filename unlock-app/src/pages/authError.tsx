import { NextPage } from 'next'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'

const AuthErrorPage: NextPage = () => {
  return (
    <AppLayout authRequired={false}>
      <div className="flex flex-col gap-10">
        <>
          <h1 className="text-4xl font-bold text-center">
            Authentification Error
          </h1>
          <ImageBar
            description="There was an error with your authentication. Please try again."
            src="/images/illustrations/img-error.svg"
          />
        </>
      </div>
    </AppLayout>
  )
}

export default AuthErrorPage
