import { PostType } from '../../../utils'
import { Link } from '../../helpers/Link'
import { SOCIAL_URL } from '../../../config/seo'
import { Button } from '@unlock-protocol/ui'

export const ABOUT_POINTS = [
  'Unlock is meant to help creators find ways to monetize without relying on a middleman. It’s a protocol — and not a centralized platform that controls everything that happens on it.',
  'The Unlock Protocol can be applied to publishing (paywalls), newsletters, software licenses or even the physical world, such as transportation systems. The web revolutionized all of these areas - Unlock will make them economically viable.',
  "Unlock's mission is about taking back subscription and access from the domain of middlemen — from a million tiny silos and a handful of gigantic ones — and transforming it into a fundamental business model for the web.",
]

export interface Props {
  updates?: PostType[]
}

export function About({ updates }: Props) {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-4">
          <header className="space-y-2">
            <h1 className="heading"> About </h1>
            <p className="sub-heading">
              Unlock is an open source, Ethereum-based protocol designed to
              streamline membership benefits for online communities.
            </p>
          </header>
          <main className="grid gap-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {ABOUT_POINTS.map((text, index) => (
                <div key={index} className="w-full p-8 glass-pane rounded-3xl">
                  <div>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full p-8 glass-pane rounded-3xl">
              <div className="space-y-8">
                <header className="grid space-y-2 text-center justify-items-center">
                  <h2 className="text-xl font-semibold sm:text-3xl">
                    We are community built and governed
                  </h2>
                  <p className="text-lg text-brand-gray sm:text-xl">
                    Join community of thousands of developers, creators and
                    governants building the future of Unlock!
                  </p>
                </header>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {Object.entries(SOCIAL_URL).map(([name, href], index) => (
                    <div key={index}>
                      <Button>
                        <Link href={href}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {updates && (
              <div className="grid gap-6 pb-6">
                <header className="space-y-2">
                  <h2 className="text-2xl font-semibold sm:text-3xl">News</h2>
                  <p className="text-lg text-brand-gray">
                    Latest updates from Unlock.
                  </p>
                </header>
                <ol className="grid gap-4">
                  {updates.map((item, index) => {
                    const date = new Date(
                      item.frontMatter.publishDate
                    ).toLocaleDateString()
                    return (
                      <li
                        key={index}
                        className="flex flex-col gap-y-0 sm:flex-row sm:gap-x-4 md:gap-x-6 lg:gap-x-8"
                      >
                        <div className="w-full max-w-[100px]">
                          <time dateTime={date} className="text-brand-gray">
                            {date}
                          </time>
                        </div>

                        <Link
                          className="hover:text-brand-ui-primary"
                          href={`/blog/${item.slug}`}
                        >
                          {item.frontMatter.title}
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
