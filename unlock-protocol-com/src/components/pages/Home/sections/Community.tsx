import { Button } from '@unlock-protocol/ui'
import { Link } from '../../../helpers/Link'
import { SOCIAL_URL } from '../../../../config/seo'

export function Community() {
  return (
    <section className="flex flex-col-reverse justify-between max-w-6xl gap-6 px-6 py-12 mx-auto md:items-center sm:flex-row">
      <div className="max-w-lg">
        <img src="/images/marketing/community-circle.png" alt="Community" />
      </div>
      <div className="max-w-sm space-y-6">
        <div className="w-full">
          <div className="w-full space-y-4 break-words">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Join the Community
            </h1>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl text-brand-gray ">
                Want to learn more? Have questions? Jump into our community!
              </p>
            </div>
          </div>
        </div>
        <div>
          <Button>
            <Link href={SOCIAL_URL.discord}> Join us on Discord</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
