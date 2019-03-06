import React from 'react'
import { storiesOf } from '@storybook/react'
import BlogPost from '../../components/content/BlogPost'

const markdownBody = `
[Unlock](https://unlock-protocol.com) is an **access control protocol** that enables creators 
to monetize their work directly - without relying on a middleman.

Consumers manage all of their subscriptions in a consistent way, as well as earn discounts when 
they share the best content and applications they use.

## Access permissions on the blockchain

Unlock is an open _protocol_ for payments on the web.

Creators place a _lock_ on their content. (This could be an article, or a software app, a whole site, a mailing list,
or anything where taking a payment could be appropriate.) Consumers can then purchase a _key_ to access that content. 
Creators can decide how expensive keys to their locks are, how many keys can exist, and how long they last for. 
Creators can create an unlimited number of locks.

The blockchain allows us to store the ledger of who owns a lock and who owns keys in a decentralized place that nobody
owns. It also allows creators to prove that they own a particular lock, and consumers to prove that they own a key for
that lock. These facts are stored in the open, and don't require proprietary software to determine. Therefore, it's easy
for any software application to integrate the Unlock protocol, free from licensing or restrictions. 

## A decentralized protocol vs a centralized product

While the open source code in this project is designed to set the standard for what the protocol can do, nobody is forced to
use our code in order to use the protocol. It would be perfectly reasonable for someone else to 
build a completely different codebase that uses the protocol. Think of this project as both a reference implementation 
and the first service to use the open Unlock protocol for payments.

Here's a random list:

 * We need to include a list here so we can make sure the style displays properly, both for long list items
 * ... and for short ones.
 * [Here's our homepage](https://unlock-protocol.com)
 
And a numbered list:

 1. We need to include a list here so we can make sure the style displays properly, both for long list items
 2. ... and for short ones.
 3. [Here's our homepage](https://unlock-protocol.com)
 
And an image:

![Unlock](https://raw.githubusercontent.com/unlock-protocol/unlock/master/unlock-app/src/static/images/unlock-word-mark.png?sanitize=true)

## Why do we need to remove middlemen?

Traditional, closed software products aim to "own the market" for a particular task. A proprietary
version of Unlock might want to provide the sole service offering a payment gateway where people make
money for their work. That single service gains enormous value, but also becomes a single point of failure:
its corporate policies decide who can make money for their work. For example, it might not support
payments from a particular country. In contrast, the Unlock Protocol project aims to create a completely
open ecosystem for payments.

On the modern web, only a handful of companies act as the gatekeeper for almost all content published
online. Their policies dictate who can and can't be heard. Sometimes those policies are positive - like
removing hate speech. But sometimes they silence minorities and prioritize harmful speech.

We want to return to an era of openness, where a wide gene pool of ideas is supported by a
genuinely collaborative ecosystem, where many companies and services can operate - just like the web itself.
`

const title = 'Introduction to Unlock'
const subtitle =
  'Unlock enables creators to monetize their work directly - without relying on a middleman.'
const publishDate = 'August 20, 2018'
const authorName = 'Reginald Pianoforte'

storiesOf('BlogPost', module)
  .add('Blog post from markdown with author and subtitle', () => {
    return (
      <BlogPost
        body={markdownBody}
        authorName={authorName}
        publishDate={publishDate}
        title={title}
        subTitle={subtitle}
        permalink="#"
      />
    )
  })
  .add('Blog post from markdown with subtitle but no author', () => {
    return (
      <BlogPost
        body={markdownBody}
        publishDate={publishDate}
        title={title}
        subTitle={subtitle}
        permalink="#"
      />
    )
  })
  .add('Blog post from markdown with author but no subtitle', () => {
    return (
      <BlogPost
        body={markdownBody}
        publishDate={publishDate}
        title={title}
        authorName={authorName}
        permalink="#"
      />
    )
  })
  .add('Blog post from markdown with no subtitle or author', () => {
    return (
      <BlogPost
        body={markdownBody}
        publishDate={publishDate}
        title={title}
        permalink="#"
      />
    )
  })
