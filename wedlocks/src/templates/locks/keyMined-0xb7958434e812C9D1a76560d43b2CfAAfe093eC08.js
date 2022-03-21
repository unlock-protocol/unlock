import path from 'path'

const absolutePath = (relative) => path.join(process.cwd(), relative)

export default {
  subject: () => 'En Direkto - The Clue',
  html: () =>
    `
<img src="cid:en-direkto.jpg"/>
<p>Well now, be prepared! HERE THE LAST CLUE ANON:</p>

<p>https://rekt.news/en-direkto-clue-52656b744851</p>

<p>
-- rekt
</p>
    `,
  attachments: [
    {
      filename: 'en-direkto.jpg',
      path: absolutePath('./src/templates/attachments/en-direkto.jpg'),
      cid: 'en-direkto.jpg',
    },
  ],
}
