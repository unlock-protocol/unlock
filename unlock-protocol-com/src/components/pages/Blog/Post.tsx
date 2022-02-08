import { FaArrowAltCircleDown } from 'react-icons/fa'
import type { PostType } from '../../../utils/posts'
import { MarketingLayout } from '../../layout/MarketingLayout'

export interface Props extends PostType {}

export function Post({ frontMatter }: Props) {
  const publishedDate = new Date(frontMatter.publishDate).toLocaleDateString()
  return (
    <MarketingLayout>
      <FaArrowAltCircleDown>
        <header>
          <h1 className="text-xl font-bold sm:text-3xl">{frontMatter.title}</h1>
          <p className="text-lg text-brand-gray"> {frontMatter.description} </p>
          <div className="text-base text-brand-gray">
            By <span> {frontMatter.authorName} </span> on{' '}
            <time dateTime={publishedDate}>{publishedDate}</time>
          </div>
        </header>
        <div className="prose"></div>
      </FaArrowAltCircleDown>
    </MarketingLayout>
  )
}
