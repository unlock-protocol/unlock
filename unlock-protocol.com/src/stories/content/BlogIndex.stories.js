import React from 'react'
import { storiesOf } from '@storybook/react'
import BlogIndex from '../../components/content/BlogIndex'

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

storiesOf('BlogIndex', module)
  .add('Blog index with multiple posts', () => {
    return <BlogIndex posts={posts} />
  })
  .add('Blog index with one post', () => {
    return <BlogIndex posts={posts.slice(0, 1)} />
  })
  .add('Blog index with no posts', () => {
    return <BlogIndex posts={[]} />
  })
