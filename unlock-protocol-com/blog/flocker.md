---
title: More on Flocker
subTitle: How to back up your Twitter followers and create portable memberships for fans and followers that will work almost anywhere
authorName: Julien Genestoux
publishDate: December 19, 2022
description: 'We are taking a radically different approach to social networking: one where the membership graph is not tied to a specific application or database!'
image: /images/blog/flocker.png
---

One of the core tenets of web3 is that users should “own” their data. The concept of “ownership” of data is itself something that’s pretty hard to grasp — or even define. That said, I’m going to give it a shot.

![Flocker](/images/blog/flocker.png)

[Join our Flock!](https://www.flocker.app/137/locks/0xb77030a7e47a5eb942a4748000125e70be598632)

I like to frame ownership as control. In the “web2” world, the data is usually completely controlled by large tech companies. This control stems directly from the fact that the data is stored in a database that _they_ host, on server for which they alone have access. Even with the best intentions in the world, and for better or worse: they have full control.

You might be wondering why this would matter to you? Here is a fresh example. Last year in 2021, Twitter acquired a company called Revue, a newsletter platform similar to Substack. This week, Twitter [announced](https://techcrunch.com/2022/12/14/twitter-shuts-down-revue-its-newsletter-platform/) they will shut down Revue. When this happens, all the data stored in their databases will becomes inaccessible, unusable (maybe even deleted forever). This means that popular writers will lose access to the content they wrote on these.

More importantly, the relationships they built with their readers will be lost as well.

**This is not acceptable.**

In the time since the Twitter acquisition was announced, millions of users have been looking for alternatives to Twitter. Some of these alternatives include Mastodon, Post, T2, and a number of other platforms.

Unfortunately, these efforts, despite their technical merits, are not building anything _fundamentally_ different. Users and their data are still “stuck” in databases, just on new and different platforms.

When data is stuck in databases, not only is it at the whims of the platform’s owner, that data is also neither “interoperable” nor “composable.” Of course, these new applications have APIs, but these APIs are exactly like the databases: they are controlled by entities that users have to:

- trust to maintain quality of service,
- trust keep their terms of service “open”,
- trust to not arbitrarily censor.

The track records of existing social networks have been poor in this respect, and there is no reason to believe that things will be different with this new wave.

Of course, solutions like Mastodon do not have a _single_ point of failure: the user could always start using another server, but they can very well be "cut" from the rest of the network or lose the data and relationships they accumulated for years... if the server they use decides to.

At Unlock, we believe the right approach is one that uses protocols. We’re not the only ones! [Jack Dorsey himself shared this](https://pastebin.com/HnBUM33b) yesterday:

> The only way I know of to truly live up to these 3 principles is a **free and open protocol** for social media, that is not owned by a single company or group of companies, and is resilient to corporate and government influence. The problem today is that we have companies who **own both the protocol and discovery of content**. Which ultimately puts one person in charge of what’s available and seen, or not. This is by definition a single point of failure, no matter how great the person, and over time will fracture the public conversation, and may lead to more control by governments and corporations around the world.

We think one of the most critical aspects of a social network (and beyond) is “membership”. Whether it’s a user who **follows** another one, a user who **joins** a group, the pattern is the same: the user becomes a **_member_**!

With Flocker, we made it trivial for **anyone** to deploy a membership contract (no wallet or crypto currency needed). We also created a landing page for every membership contract where the creator can link to all of the places on the web where their members can access their content. Of course, the membership contract itself is **not** tied to the Flocker app, and we (Unlock Labs), have absolutely no control over it. This means memberships belong to the people creating them, and this also means memberships can easily be used in [Highlight](https://highlight.xyz/), [Beem](http://beem.xyz/), [Guild.xyz](https://guild.xyz/), [Tropee](https://www.tropee.com/), [Paragraph](https://paragraph.xyz/) and a growing number of applications.

We’d love it if you could [deploy a flock with Flocker](https://flocker.app/)! Please share it with us and we’ll become the first members of your flock!
