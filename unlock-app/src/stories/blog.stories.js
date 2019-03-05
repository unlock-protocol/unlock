import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { ConfigContext } from '../utils/withConfig'
import createUnlockStore from '../createUnlockStore'
import Post from '../pages/post'

const ConfigProvider = ConfigContext.Provider

const store = createUnlockStore({})

const config = {
  env: 'production',
  unlockUrl: 'http://foo',
}

storiesOf('Blog pages', module)
  .addDecorator(getStory => (
    <ConfigProvider value={config}>{getStory()}</ConfigProvider>
  ))
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('Blog post page', () => {
    const slug = 'testpost'
    const post = {
      title: 'Sample title',
      subTitle: 'Some advice from the field',
      authorName: 'Alice "Storybook" Bob',
      publishDate: 'August 20, 2018',
      description: 'A test blog post for Storybook',
      __content: `
This is some sample markdown content for the purposes of displaying a blog post within Storybook. You can edit this
markdown content within the blog post story itself.

## How can I write blog posts?

Blog posts are written as markdown files and saved in /static/blog/. They will be displayed in file order. Publish dates
are intentionally not generated from this file date, in case we want to override the date.

 * You can use any standard markdown
 * All you need to do is edit the markdown file and the system will do the rest
 * The blog uses standard components and system styles so there is no separate style system to maintain
 
## Anything else?

**Here is some bold text.** We can also _italicize text_ or [link to outside websites](https://unlock-protocol.com).
`,
    }

    return <Post slug={slug} post={post} />
  })
