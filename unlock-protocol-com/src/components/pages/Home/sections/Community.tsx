import { Button } from '@unlock-protocol/ui'
import { Link } from '../../../helpers/Link'
import { SOCIAL_URL } from '../../../../config/seo'

export function Community() {
  return (
    <section className="flex flex-col-reverse justify-between gap-6 px-6 py-12 mx-auto max-w-7xl md:items-center sm:flex-row">
      <div className="max-w-lg">
        <img src="/images/marketing/community-circle.png" alt="Community" />
      </div>
      <div className="max-w-sm space-y-2 xl:max-w-2xl">
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
