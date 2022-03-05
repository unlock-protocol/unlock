import path from 'path'

const absolutePath = (relative) => path.join(process.cwd(), relative)

export default {
  subject: () => 'You are going to En Direkto!',
  html: () =>
    `
<img src="cid:en-direkto.jpg"/>
<p>Well now, be prepared! See you soon Anon.</p>
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
