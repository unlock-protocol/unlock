import { remark } from 'remark'
import html from 'remark-html'

export async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(html, {
      // We use arbitrary html in markdown
      sanitize: false,
    })
    .process(markdown)
  return result.toString()
}
