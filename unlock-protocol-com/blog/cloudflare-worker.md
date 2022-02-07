---
title: The Unlock Cloudflare Worker
subTitle: Or, how to put a lock on any website without changing its code!
authorName: Julien Genestoux
publishDate: March 31, 2020
description: Cloudflare is a leading Content Delivery Network provider. Web sites and application can use Cloudflare to add a layer between consumers and their applications in order to increase delivery speed, reduce the impact of attacks... or, add an Unlock lock!
image: /images/blog/cloudflare-workers/cloudflare-workers.png
---

As part of its CDN architecture, [Cloudflare](https://cloudflare.com) recently introduced the concept of "[Workers](https://workers.cloudflare.com/)"... These are lambda functions which get executed on every requests going through Cloudflare's CDN. It's very similar to the **middleware architecture** popularized in several HTTP frameworks such as ruby's [Rack](https://github.com/rack/rack) or Node.js's Express.

A Worker can be used to alter a request or a response, or even completely rewrite these. Their [boilerplate section](https://developers.cloudflare.com/workers/templates) shows several interesting use cases which can be added to your website or application today.

# Token gating with a lock

As the web is [moving away from ads as its only business model](https://medium.com/unlock-protocol/the-end-of-the-ad-supported-web-d4d093fb462f), many websites are adding paywalls or other kinds of memberships to restrict access to some content or features. _Unfortunately, from a developer perspective, adding a a membership to a website is non-trivial_. Publishers have to first add a database of user accounts, then, they have to add mechanisms to collect payments, and finally they have to add logic to each of their webpage to enforce access control.

This amount of work not only takes times and resources, but often, it is not even not compatible with some other architectural constraints: static sites for examples, cannot implement this kind of access control... Similarly, for end users, a web where users have to create accounts with every single web site is only going to mean that we'll user even fewer websites: the friction would be just too high.

## Inroducing the Unlock Cloudflare Worker!

By now, you know that Unlock is a **protocol for memberships** as NFT. It _decouples_ the membership itself from the website to which these memberships apply. This means that the website does not have to implement mechanisms itself to enforce access control, as they can be implemented at a different layer, and the CDN is actually a great place to do this, with the help of the [Unlock Cloudflare Worker](https://github.com/unlock-protocol/cloudflare-worker)!

### How to to token-gate a website with Cloudflare

#### Clone the repo:

```bash
git clone git@github.com:unlock-protocol/cloudflare-worker.git
```

#### Configure worker

Update its `.src/config.js` file to match your needs. Importantly, you need to keep the `pessimistic` mode to be `true` .

#### Install dependencies

```bash
yarn
```

#### Push to cloudflare

```bash
yarn wrangler publish
```

(You will likely be prompted to login to CloudFlare first)

#### Configure website

Now that the worker is deployed, you need to link it to your CloudFlare sites. Your mileage may vary but here is howe we did it for https://token-gated.com. From the Cloudflare Dashboard, select your website, in the left column, click on "Workers". Click the `Add Route` button. Enter the route(s) you want to "token-gate". In the `Service` select, pick the `unlock-cloudflare-worker` and select the environment of choice. Hit `Save`. You're all set!

![Screen Recording 2022-02-05 at 05 38 31 PM](https://user-images.githubusercontent.com/17735/152661436-347c9ccf-a9fb-4d1e-8b3a-817ecfb2a887.gif)

# Closing thoughts

Our approach in this example is fairly brute-force: every request to a domain is intercepted by our worker and,
the content is locked unless the visitor is a member. One could easily implement other kinds of locking,
maybe by rewriting the CSS files and enabling a completely different version of the website. Another option would be to automatically remove all ads from the content if the user is a member... etc. You could easily lock video content as well, by rendering a preview video, rather than the full version.

> Since Unlock **supports credit cards**, using an Unlock Worker is the simplest way to start monetizing your content for anyone on the web!

The [web is an operating system](https://unlock-protocol.com/blog/access-control-primitive/), Unlock is its access control layer, and Cloudflare, as a middleware is the perfect place to implement it!

PS: to the Workers team at Cloudflare: thank you... and maybe one feature request: please let workers creators like us "package" our workers so that they can be installed and configured from inside of the Cloudflare UI by other website owners!
