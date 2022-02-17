import { Button } from '@unlock-protocol/ui'
import { Link } from '../../helpers/Link'
import { BulletPointIcon } from '../../icons'
import { CenteredColumn } from '../../layout/Columns'

const UNLOCK_JOB_BENEFITS = [
  'Comprehensive health care (including dental and vision) depending on location.',
  'Unlimited personal and vacation days.',
  'Learning and development budget for each employee.',
  'Monthly wellness stipend that can be used for a gym membership, nutrition counseling, yoga or meditation classes, or any other wellness activity of your choice.',
  'Your choice of technical setup (laptop, monitors and software licenses).',
]

const UNLOCK_INTERVIEW_STEPS = [
  'Initial chat conversation with our founder Julien',
  'Depending on the role, you will have more interviews with Julien and other team and community members.',
  "We'll call the references you provide.",
]

export function Jobs() {
  return (
    <CenteredColumn>
      <div className="pt-24 pb-6 px-6">
        <header className="space-y-1 leading-relaxed">
          <h1 className="font-bold text-xl sm:text-3xl"> Work at Unlock </h1>
          <p className="text-brand-gray text-lg">
            We want to provide an environment where you can do your best work.
          </p>
        </header>
        <main>
          <div className="space-y-4 py-6">
            <h2 className="font-semibold text-lg sm:text-xl">
              Our Work Benefits
            </h2>
            <ol className="flex flex-col gap-4">
              {UNLOCK_JOB_BENEFITS.map((benefit, index) => (
                <li key={index} className="flex gap-6 items-center">
                  <span>
                    <BulletPointIcon
                      size={16}
                      className="fill-brand-ui-primary"
                    />
                  </span>
                  <p> {benefit}</p>
                </li>
              ))}
            </ol>
          </div>
          <section className="space-y-4 py-6">
            <header className="space-y-1">
              <h2 className="font-semibold text-lg sm:text-xl">
                Interview Process
              </h2>
              <p className="text-brand-gray sm:text-lg">
                We&apos;ve clearly-defined our hiring process in order to
                evaluate your application in a fair, inclusive way, as well as
                to let you prepare.
              </p>
            </header>

            <ol className="flex flex-col gap-4">
              {UNLOCK_INTERVIEW_STEPS.map((benefit, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <span>{index + 1}.</span>
                  <p> {benefit}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="py-6">
            <div className="flex gap-6">
              <Button
                href="mailto:julien@unlock-protocol.com"
                variant="secondary"
                as={Link}
              >
                Ask Questions
              </Button>
              <Button
                href="https://unlockprotocol.notion.site/Unlock-Jobs-907811d15c4d490091eb298f71b0954c"
                as={Link}
              >
                Apply
              </Button>
            </div>
          </section>
        </main>
      </div>
    </CenteredColumn>
  )
}
