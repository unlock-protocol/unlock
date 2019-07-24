import React from 'react'
import { storiesOf } from '@storybook/react'
import Post from '../pages/post'
import Blog from '../pages/blog'

storiesOf('Blog pages', module)
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
  .add('Blog index page', () => {
    const posts = [
      {
        title: 'Latest post',
        authorName: 'Unlock team',
        publishDate: 'Tuesday, March 5, 2019',
        description: `
This post was published most recently. It is an important post about a great many things, all of which are vital. You
should pay great attention.`,
        slug: 'post3',
      },
      {
        title: 'Another post from us!',
        authorName: 'Julien Genestoux',
        publishDate: 'Friday, March 1, 2019',
        description: `
Short description.`,
        slug: 'post2',
      },
      {
        title: 'This is our first post.',
        authorName: 'Unlock team',
        publishDate: 'Monday, August 20, 2018',
        description: `
Look at us! We're posting on our very own blog! How exciting!`,
        slug: 'post1',
      },
    ]
    return <Blog posts={posts} page={5} totalPages={9} />
  })
