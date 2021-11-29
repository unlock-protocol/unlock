---
title: Introducing the Latest Unlock Paywall
subTitle: Leaner, faster, and evergreen
authorName: Christopher Nascone
publishDate: April 8, 2020
description: Unlock introduces a new paywall architecture in response to customer needs
image: /images/blog/introducing-latest-paywall/paywall.png
---

The Unlock Paywall has evolved substantially over the past year, from a more traditional paywall that blocked a page to a configurable and embeddable tool that enabled all kinds of memberships. Here's our latest release, crafted in direct response to our customers' needs and our own experience.

# Subtracting Weight Makes You Faster Everywhere

Modern web apps are usually quite large, which makes them less usable on mobile networks or low-bandwidth connections. The Unlock Paywall feels this issue more acutely than most applications because it's intended to be embedded on another page, which itself is probably quite large. As adoption of our protocol grew, we identified several key challenges we'd have to solve:

- Too large a bundle size
- Too many network requests
- Too many dependencies

## Bundle Size

The previous iteration of our paywall consisted of several subsytems. We did load these separately to avoid having one huge blob that needed to come down before anything could start, but it was clear to us that we could go further. We were able to shrink our architecture to only require a very slim wrapper script loaded into the client page and one iframe to handle key purchases. Because the key purchase iframe is lazy-loaded, most interactions with a locked page don't need to download it at all.

## Too Many Network Requests

Previously, our application did a lot of polling to various places to maintain an accurate picture of a member's status. Over time we've managed to shrink this dramatically by choosing more carefully what information we really need for a good checkout experience, and being more clever about how to get that subset of data. This has been an ongoing process for some time now, but it culminates in the latest paywall release which prunes some of the chattiest parts of the application.

## Too Many Dependencies

We previously used a library to handle Web3 calls on the paywall (to some extent we still do, but only in the lazy-loaded checkout iframe). We found that this library contributed some substantial weight to our application, when it was only being used for a handful of calls. We found that it wasn't hard for us to manually implement methods to make these calls to the chain, which saved us both time and space.

# Greater Capabilities With Less Code

We've managed to make these changes without compromising the functionality of our paywall application at all. In fact, this rearchitecture made it possible to move more quickly while implementing new features that previously would have taken a lot more effort. The first and most visible update is a UI overhaul that takes up less space and works a lot better on mobile devices. We'll have more news on what's next in the pipeline in future blog posts.

# An Evergreen Deployment Model

If you've integrated Unlock on your site before, you'll have noticed that you load the script `unlock.1.0.min.js`. So is today's announcement about `unlock.2.0.min.js`? Nope! Because we aren't making any breaking changes to the Paywall API and we want to ensure that consumers can smoothly and quickly get the latest and greatest code, we've moved to an explicitly "evergreen" model. Loading `unlock.latest.min.js` on your page will ensure that you're always up-to-date and get continuous improvements with every production deploy we do. [Our docs](https://docs.unlock-protocol.com) have been updated to this effect.
