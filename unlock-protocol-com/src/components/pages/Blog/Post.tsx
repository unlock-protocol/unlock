import type { PostType } from '../../../utils/posts'

export interface Props extends PostType {}

export function Post({ frontMatter }: Props) {
  return (
    <article>
      <header> {frontMatter.title}</header>
    </article>
  )
}
