import { Button } from '@unlock-protocol/ui'
import { Link } from '../../../helpers/Link'
import { SOCIAL_URL } from '../../../../config/seo'

export function Community() {
  return (
    <section className="flex flex-col-reverse justify-between gap-6 mx-auto sm:gap-x-16 max-w-7xl md:items-center sm:flex-row">
      <div className="max-w-lg">
        <img src="/images/marketing/community-circle.png" alt="Community" />
      </div>

      <div className="max-w-sm space-y-2 xl:max-w-2xl">
        <div>
          <img
            aria-hidden
            className="pb-8 not-sr-only sm:hidden"
            alt="frame"
            src="/images/svg/mobile-frame.svg"
          />
          <img
            aria-hidden
            className="hidden max-w-sm pb-8 not-sr-only lg:max-w-none sm:block"
            alt="frame"
            src="/images/svg/desktop-frame-6.svg"
          />
        </div>
        <h1 className="heading">Join the Community</h1>
        <p className="sub-heading">
          Want to learn more? Have questions? Jump into our community!
        </p>
        <div className="pt-6">
          <Button>
            <Link href={SOCIAL_URL.discord}> Join us on Discord</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
