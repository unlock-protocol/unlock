---
title: The Unlock Cloudflare Worker
subTitle: Or, how to put a lock on any website without changing its code!
authorName: Julien Genestoux
publishDate: March 31, 2020
description: Cloudflare is a leading Content Delivery Network provider. Web sites and application can use Cloudflare to add a layer between consumers and their applications in order to increase delivery speed, reduce the impact of attacks... or, add an Unlock lock!
image: /static/images/blog/cloudflare-workers/cloudflare-workers.png
---

As part of its CDN architecture, [Cloudflare](https://cloudflare.com) recently introduced the concept of "[Workers](https://workers.cloudflare.com/)"... These are lambda functions which get executed on every requests going through Cloudflare's CDN. It's very similar to the **middleware architecture** popularized in several HTTP frameworks such as ruby's [Rack](https://github.com/rack/rack) or Node.js's Express.

A Worker can be used to alter a request or a response, or even completely rewrite these. Their [boilerplate section](https://developers.cloudflare.com/workers/templates) shows several interesting use cases which can be added to your website or application today.

# Adding a lock

As the web is [moving away from ads as its only business model](https://medium.com/unlock-protocol/the-end-of-the-ad-supported-web-d4d093fb462f), many websites are adding paywalls or other kinds of memberships to restrict access to some content or features. _Unfortunately, from a developer perspective, adding a a membership to a website is non-trivial_. Publishers have to first add a database of user accounts, then, they have to add mechanisms to collect payments, and finally they have to add logic to each of their webpage to enforce access control.

This amount of work not only takes times and resources, but often, it is not even not compatible with some other architectural constraints: static sites for examples, cannot implement this kind of access control...  Similarly, for end users, a web where users have to create accounts with every single web site is only going to mean that we'll user even fewer websites: the friction would be just too high.

## Inroducing the Unlock Cloudflare Worker!

By now, you know that Unlock is a protocol for memberships. It _decouples_ the membership itself from the website to which these memberships apply. This means that the website does not have to implement mechanisms itself to enforce access control, as they can be implemented at a different layer, and the CDN is actually a great place to do this, with the help of the [Unlock Cloudflare Worker](https://github.com/unlock-protocol/cloudflare-worker)!

### How to to lock a website with Cloudflare

First, you would need to have a website and configure it so that it uses Cloudflare as its CDN. As an example, we have deployed a new website: [unlock.community](https://unlock.community). This website is a static HTML website (it's actually [hosted on Github](https://github.com/unlock-protocol/community/) so you can view its source code... even though in a real world example, it is probably not what you would want to do if you want to make sure that only paying members can view its content!)

We then need to add a worker to the website. From the Cloudflare interface, click on "Workers".

![workers](/static/images/blog/cloudflare-workers/workers.png)

Then, click on *Manage Workers*. This page will let you deploy a worker. We have [created a worker](https://github.com/unlock-protocol/cloudflare-worker) that you can use as-is, but you are also welcome to fork this repo and modify it to match your needs.

![create worker](/static/images/blog/cloudflare-workers/create-worker.png)

You can use the `wrangler` tool provided by the team at Cloudflare to deploy your own fork of the worker, but make sure you change its settings!

Once the worker is deployed, you need to "hook" it to your website. This can be done by adding a _Route_ to your website's worker panel. In our case, we want any request to our website `unlock.community/*` to go through our worker.

![hooking worker](/static/images/blog/cloudflare-workers/hooking-worker.png)

Once, this is done, you're all set! You have successfuly added a membership to your website so that only paying members are able to access its content.


### How does the Worker work?

Let's go [under the hood](https://github.com/unlock-protocol/cloudflare-worker/blob/master/src/index.js) to identify how the worker, well, works.

Let's start with a bit of boilerplate configuration.

```javascript
// Cloudflare even has its own Ethereum Gateway!
// See https://www.cloudflare.com/distributed-web-gateway/#ethereum-gateway
const provider = 'https://cloudflare-eth.com/'

// This is used for "optimistic" unlocking: a service which ensures
// that "pending" transactions are still taken into account to unlock
// a page.
// See https://unlock-protocol.com/blog/hello-optimistic-unlocking/
const locksmithUri = 'https://locksmith.unlock-protocol.com/'

// This is the config for Unlock's paywall application.
// You can change it to ask members to submit their email addresses
// or support credit cards payments.
// See https://docs.unlock-protocol.com/#configure-the-paywall
const unlockConfig = {
  icon: 'https://app.unlock-protocol.com/static/images/svg/default.svg',
  persistentCheckout: true,
  locks: {
    "0xB0114bbDCe17e0AF91b2Be32916a1e236cf6034F": { }
  },
  callToAction: {
    default: `This content is locked. You need to purchase a membership
      in order to access it.`,
    expired: `Your previous membership has expired. Please, purchase a
      new one to access this content.`,
    noWallet: `This is content is locked. You need to use a crypto
      wallet in order to unlock it.`,
  }
}
```


Each Cloudflare worker uses a handler to process requests using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```javascript
// The handler which acts as an entry point for Cloudflare's worker.
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
```

Our handler is fairly simple. We use cookies to identify if a visitor has already obtained a membership, in order to avoid asking the user to confirm their membership on every page load. So, the first step is to check for a cookie called `unlockAccount`. If there is one, then we use a convenience library provided by Unlock to check if this account owns a key to any of the locks.

```javascript
async function handleRequest(request) {
  // Extract the cookies
  const cookiesHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(cookiesHeader.split('; ')
    .map(x => x.split('=')))

  // If a cookie includes an Unlock account
  // (note: a more "secure" version should ask the user to
  // sign a message... and we could extract the signer rather
  // than 'trust' the cookie.
  if (cookies.unlockAccount) {
    // Let's check that this user has a valid key
    // Convenience library which checks membership on chain.
    // Note: this could be cached (for a few hours?) thru
    // Cloudflare workers' key/value stores
    const unlocked = await paywall.isUnlocked(
      cookies.unlockAccount,
      unlockConfig,
      {
        provider,
        locksmithUri,
      }
    )
    // If the page is unlocked, we just 'resume' loading
    // of the content.
    // Improvement: use a counter to provide a metered approach!
    if (unlocked) {
      return fetch(request)
    }
  }

  // If the user cannot be identified through cookies, or if they do
  // not have a valid key. we just show them a page indicating that
  // they need to checkout.
  // In a future version, we could also use a "splash" screen from
  // the proxied website to make sure the UI stays consistent.
  const doc = `
<html>
<head>
  <title>Locked page!</title>
  <script> (function(d, s) {
  var js = d.createElement(s),
  sc = d.getElementsByTagName(s)[0];
  js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";
  sc.parentNode.insertBefore(js, sc); }(document, "script"));
  </script>
  <script>
    var unlockProtocolConfig = ${JSON.stringify(unlockConfig)}
  </script>
</head>
<body>
  <script>
    window.addEventListener('unlockProtocol', function(e) {
      var state = e.detail
      if (state === 'locked') {
        // We load the Unlock checkout modal
        window.unlockProtocol.loadCheckoutModal();
      } else if (state === 'unlocked') {
        // Let's set a cookie based on the user's address
        document.cookie = 'unlockAccount=' +
          unlockProtocol.getUserAccountAddress() +
          '; Max-Age=1800';
        // We should then reload the page.
        window.location.reload();
      }
    })
  </script>
</body>
</html>
`
  // Render the template and use HTTP status 402 (payment required!)
  return new Response(doc, {
    status: 402,
    headers: {
      'Content-type': 'text/html'
    }
  })
}
```

# Closing thoughts

Our approach in this example is fairly brute-force: every request to a domain is intercepted by our worker and,
the content is locked unless the visitor is a member. One could easily implement other kinds of locking,
maybe by rewriting the CSS files and enabling a completely different version of the website. Another option would be to automatically remove all ads from the content if the user is a member... etc. You could easily lock video content as well, by rendering a preview video, rather than the full version.

> Since Unlock **supports credit cards**, using an Unlock Worker is the simplest way to start monetizing your content for anyone on the web!

The [web is an operating system](https://unlock-protocol.com/blog/access-control-primitive/), Unlock is its access control layer, and Cloudflare, as a middleware is the perfect place to implement it!


PS: to the Workers team at Cloudflare: thank you... and maybe one feature request: please let workers creators like us "package" our workers so that they can be installed and configured from inside of the Cloudflare UI by other website owners!
