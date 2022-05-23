import type { PostsIndexType } from '../../../utils/posts'
import { Link } from '../../helpers/Link'
import { useRouter } from 'next/router'

export type Props = PostsIndexType

export function PostsIndex({ posts, next, prev, total }: Props) {
  const router = useRouter()
  return (
    <main className="max-w-3xl p-6 mx-auto">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold"> Unlock Blog </h1>
        <p className="text-xl text-brand-gray">
          We&apos;re building the new business model for the web that empowers
          creators. Unlock the potential of memberships!
        </p>
      </header>
      <div className="grid gap-12 py-8">
        <div className="grid gap-8">
          {posts.map(({ frontMatter, slug }) => {
            const date = new Date(frontMatter.publishDate).toLocaleDateString()
            return (
              <div
                key={slug}
                className="grid items-center justify-items-center sm:justify-items-start sm:grid-cols-[2fr_6fr] gap-8"
              >
                <img
                  className="overflow-hidden rounded"
                  src={frontMatter.image}
                  alt={frontMatter.title}
                />
                <div className="space-y-1">
                  <Link
                    className="text-xl font-medium hover:text-brand-ui-primary"
                    href={`/blog/${slug}`}
                  >
                    {frontMatter.title}
                  </Link>
                  <p className="text-brand-gray">
                    By {frontMatter.authorName} on{' '}
                    <time dateTime={date}>{date}</time>
                  </p>
                  <p className="text-brand-gray">{frontMatter.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between gap-4 text-sm sm:text-base">
          <div className="space-x-2">
            {!['/blog/1', '/blog'].includes(router.pathname) && (
              <Link href="/blog"> {'<--'} First </Link>
            )}

            {!!prev && (
              <>
                <span> | </span>
                <Link href={`/blog/${prev}`}> Previous</Link>
              </>
            )}
          </div>

          <div className="space-x-2">
            {next && <Link href={`/blog/${next}`}> Next </Link>}
            {total && next && (
              <>
                <span> | </span>
                <Link href={`/blog/${total}`}> Last {'-->'} </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
