import { NextPage } from 'next'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'

const Page404: NextPage = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-10">
        <h1 className="text-4xl font-bold text-center">Page Not Found</h1>
        <ImageBar
          description="The page you were looking for could not be found."
          src="/images/illustrations/img-error.svg"
        />
      </div>
    </AppLayout>
  )
}

export default Page404
