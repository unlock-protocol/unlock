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
  useEffect(() => {
    const commentoScript = document.createElement('script')
    if (isMember === 'yes') {
      commentoScript.src = 'https://cdn.commento.io/js/commento.js'
      commentoScript.async = true
      commentoScript.setAttribute('data-no-fonts', 'false')
      document.body.appendChild(commentoScript)
    }
    return () => {
      commentoScript.remove()
    }
  }, [isMember])
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
        <footer className="pt-4 mt-4 border-t">
          {isMember === 'yes' ? (
            <div id="commento"></div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center">
              <p> You can read or write comments by becoming a member. </p>
              <Button onClick={() => becomeMember()}>Unlock Comments</Button>
            </div>
          )}
        </footer>
      </article>
    </div>
  )
}
