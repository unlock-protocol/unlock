import path from 'path'
import { readdir, readFile } from 'fs/promises'
import matter from 'gray-matter'

export const BLOG_PATH = path.join(process.cwd(), 'blog')
export const POST_EXTENTION_REGEX = /\.md?$/

export async function getPost(
  postFilePath: string,
  dirPath: string
): Promise<PostType> {
  const postFileAbsolutePath = path.join(dirPath, postFilePath)
  const post = await readFile(postFileAbsolutePath, 'utf-8')
  const { content, data } = matter(post)
  const slug = postFilePath.replace(POST_EXTENTION_REGEX, '')
  return {
    content,
    filePath: postFilePath,
    slug,
    frontMatter: data as PostFrontMatter,
  }
}

export async function getPosts(baseDirectoryPath: string): Promise<PostType[]> {
  const filePaths = await readdir(baseDirectoryPath)
  const postFilePaths = filePaths.filter((filePath) =>
    POST_EXTENTION_REGEX.test(filePath)
  )
  const posts = await Promise.all(
    postFilePaths.map(async (postFilePath) => {
      const post = await getPost(postFilePath, baseDirectoryPath)
      return post
    })
  )
  return posts
}

export interface PostFrontMatter {
  title: string
  subTitle: string
  authorName: string
  publishDate: string
  description: string
  image: string
}

export interface PostType {
  frontMatter: PostFrontMatter
  content: string
  filePath: string
  slug: string
}

export interface PostsIndexType {
  posts: PostType[]
  next: number | null
  prev: number | null
  total: number | null
}
