import type { PostsIndexType } from '../../../utils/posts'
import { Link } from '../../helpers/Link'
import Footer from '../../interface/Footer'
import { Navigation } from '../../interface/Navigation'
import { useRouter } from 'next/router'

export interface Props extends PostsIndexType {}

export function PostsIndex({ posts, next, prev, total }: Props) {
  const router = useRouter()
  return (
    <div>
      <Navigation />
      <div className="max-w-screen-lg px-4 mx-auto py-28">
        <header>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold"> Unlock Blog </h1>
            <p className="text-xl text-brand-gray">
              We&apos;re building the new business model for the web that
              empowers creators. Unlock the potential of memberships!
            </p>
          </div>
        </header>
        <main>
          <div className="grid gap-12 py-8">
            <div className="grid gap-8">
              {posts.map(({ frontMatter, slug }) => (
                <div
                  key={slug}
                  className="grid items-center justify-items-center sm:justify-items-start sm:grid-cols-[1fr_6fr] gap-8"
                >
                  <img
                    className="overflow-hidden rounded"
                    src={frontMatter.image}
                    alt={frontMatter.title}
                  />
                  <div>
                    <Link
                      className="text-xl font-medium hover:text-brand-ui-primary"
                      href={`/blog/${slug}`}
                    >
                      {frontMatter.title}
                    </Link>
                    <p className="text-brand-gray">{frontMatter.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-4">
              <div>
                {!['/blog/1', '/blog'].includes(router.pathname) && (
                  <Link href="/blog"> First page </Link>
                )}
              </div>
              <div className="flex gap-6">
                {prev && <Link href={`/blog/${prev}`}> Previous Page </Link>}
                {next && <Link href={`/blog/${next}`}> Next Page </Link>}
                {total && <Link href={`/blog/${total}`}> Last Page </Link>}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
