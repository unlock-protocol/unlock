---
title: Unlock's redesigned checkout is here
subTitle: We are making our redesigned checkout default for all users.
authorName: searchableguy
publishDate: August 25, 2022
description: We are making our redesigned checkout default for all users.
image: /images/blog/unlock-new-checkout-here/checkout.png
---

![checkout](/images/blog/unlock-new-checkout-here/checkout.png)

We made a post announcing preview of our [redesigned checkout](./redesigning-our-checkout.md) in july. Since then, we have received a lot of feedback and iterated on it. We're transitioning everyone to new checkout today.

## What's changed?

### Payment options

We added the missing support for superfluid and claiming memberships. If any of those payment methods are enabled for your checkout, they will automatically show up as options to users.

![checkout payment](/images/blog/unlock-new-checkout-here/checkout-payment.png)

### Reducing the steps

Many users said they found quantity page redudant in most situation. Most of them buy a single membership so it wasn't useful. We now skip the quantity page by default unless creators set up `minRecipients` or `maxRecipients` in their paywall configuration.

![checkout recipients](/images/blog/unlock-new-checkout-here/checkout-recipients.png)

### Improved progress indication

Some of you expressed that it was hard to know when a purchase was successful or which stage you were on since all of the progression indiciators looked the same.

We've added explicit messages and numberised the steps so it's easy to keep track of your progress.

![checkout finished](/images/blog/unlock-new-checkout-here/checkout-finished.png)

## How can I use the old checkout?

The old checkout will be available at `https://app.unlock-protocol.com/legacy/checkout` path.

If you are using our paywall script in your apps, append `?legacy=true` to the paywall url you are loading. It will open the old checkout.

We won't be maintaining old checkout anymore so you should move away from it as soon as you are able to. We'll deprecate these path by the end of the year.

## What if I found an issue or bug in the new checkout?

Please open an issue on github or tell us in the discord. We'll will fix it ASAP. In the meantime, you can use the old checkout.

## What are the breaking changes?

We've not made any breaking changes. Everything that worked before should as is.

There is one notable change we've done after user testing and feedback from community - we've reduced the amount of information we display and as such, stop showing call to actions specified in the paywall configuration.

We might re-introduce them later and having them in your config right now won't break anything so it's fine if you leave it as it is.
