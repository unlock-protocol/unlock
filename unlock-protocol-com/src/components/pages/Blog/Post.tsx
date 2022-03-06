import { useMembership } from '../../../hooks/useMembership'
import type { PostType } from '../../../utils/posts'
import Script from 'next/script'
import { Button } from '@unlock-protocol/ui'

export interface Props extends PostType {
  htmlContent: string
}

export function Post({ frontMatter, htmlContent }: Props) {
  const publishedDate = new Date(frontMatter.publishDate).toLocaleDateString()
  const { isMember, becomeMember } = useMembership()

  return (
    <div className="max-w-3xl px-6 pb-24 mx-auto">
      <article>
        <header className="py-4 space-y-4">
          <h1 className="text-3xl font-bold sm:text-5xl">
            {frontMatter.title}
          </h1>
          <div className="space-y-1">
            <p className="text-lg sm:text-xl text-brand-gray">
              {frontMatter.description}
            </p>
            <div className="py-4 text-base text-brand-gray">
              By <span> {frontMatter.authorName} </span> on{' '}
              <time dateTime={publishedDate}>{publishedDate}</time>
            </div>
          </div>
        </header>
        <main
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="prose break-words sm:prose-lg prose-img:rounded-xl prose-a:text-brand-ui-primary hover:prose-a:text-brand-ui-secondary prose-slate max-w-none"
        />
        <footer>
          {isMember === 'yes' ? (
            <div id="commento"></div>
          ) : (
            <div className="flex items-center justify-center p-2">
              <Button onClick={() => becomeMember()}>Unlock Comments</Button>
            </div>
          )}
        </footer>
      </article>
      <Script
        defer
        async
        src="https://cdn.commento.io/js/commento.js"
        strategy="afterInteractive"
        data-auto-init="false"
      ></Script>
    </div>
  )
}
