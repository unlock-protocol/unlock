import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'
import { Placeholder } from '@unlock-protocol/ui'
import Link from 'next/link'

const Page404: NextPage = () => {
  const { query, isReady } = useRouter()

  const wasEventPage = query.path?.toString().match(/\/event\//)

  return (
    <AppLayout authRequired={false}>
      <div className="flex flex-col gap-10">
        {!isReady && (
          <Placeholder.Root>
            <Placeholder.Line size="xl" />
            <Placeholder.Image className="h-[600px] w-full"></Placeholder.Image>
            <Placeholder.Line size="lg" />
          </Placeholder.Root>
        )}
        {isReady && !wasEventPage && (
          <>
            <h1 className="text-4xl font-bold text-center">Page Not Found</h1>
            <ImageBar
              description="The page you were looking for could not be found."
              src="/images/illustrations/img-error.svg"
            />
          </>
        )}
        {isReady && wasEventPage && (
          <>
            <h1 className="text-4xl font-bold text-center">
              Event Page Not Found
            </h1>
            <ImageBar
              description={
                <p>
                  The event page you were looking for could not be found. Back
                  to{' '}
                  <Link
                    href="/event"
                    className="text-brand-ui-primary underline"
                  >
                    Event By Unlock
                  </Link>
                </p>
              }
              src="/images/illustrations/img-error.svg"
            />
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default Page404
