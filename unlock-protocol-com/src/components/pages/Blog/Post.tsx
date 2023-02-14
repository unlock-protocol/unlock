import { useMembership } from '../../../hooks/useMembership'
import type { PostType } from '../../../utils/posts'
import { Button } from '@unlock-protocol/ui'
import { useEffect } from 'react'

export interface Props extends PostType {
  htmlContent: string
}

export function Post({ frontMatter, htmlContent }: Props) {
  const publishedDate = new Date(frontMatter.publishDate).toLocaleDateString()
  const { isMember, becomeMember } = useMembership()

  return (
    <div className="max-w-3xl p-6 pb-24 mx-auto">
      <article>
        <header className="py-4 space-y-4">
          <h1 className="text-3xl font-bold sm:text-5xl">
            {frontMatter.title}
          </h1>
          <div className="space-y-1">
            <p className="text-lg sm:text-xl text-brand-gray">
              {frontMatter.description}
            </p>
            <div className="py-2 text-base text-brand-gray">
              By <span> {frontMatter.authorName} </span> on{' '}
              <time dateTime={publishedDate}>{publishedDate}</time>
            </div>
          </div>
        </header>
        <main
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="prose break-words sm:prose-lg prose-img:rounded-xl prose-a:text-brand-ui-primary hover:prose-a:text-brand-ui-secondary prose-slate max-w-none"
        />
      </article>
    </div>
  )
}
