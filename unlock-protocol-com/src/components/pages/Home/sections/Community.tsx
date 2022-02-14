import { Button } from '@unlock-protocol/ui'
import { Link } from '../../../helpers/Link'
import { SOCIAL_URL } from '../../../../config/seo'

export function Community() {
  return (
    <div className="flex flex-col-reverse items-center gap-4 sm:gap-12 md:gap-24 lg:gap-32 sm:flex-row">
      <div className="w-full ">
        <img src="/images/marketing/community-circle.png" alt="Community" />
      </div>
      <div className="space-y-6">
        <div className="w-full sm:min-w-[400px]">
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
    </div>
  )
}
