---
title: The Graph
subTitle: Leveraging the Graph Protocol to improve user experience and rapidly iterate on ideas
authorName: Akeem Adeniji
publishDate: September 25, 2019
description: 'Using the Graph Protocol for faster iteration on Ethereum based products'
image: /images/blog/the-graph-blog-post/thegraphlogo.png
---

We've started using [The Graph](https://thegraph.com/) to provide us with a faster way of iterating on user facing ideas; leveraging the ability to utilized aggregated on chain data.

Earlier this month while hacking on a proof of concept, we realized that we couldn't reasonably bring the feature to market without an aggregation layer.

Enter Graph Protocol, while being released last year(2018) we really hadn't had a chance to give it a go. When their team announced a [hackathon](https://thegraph.com/hackathon) we decided to dive in and were not disappointed.

Being an extremely small team, ingestion solutions under consideration needed to be robust enough to handle our immediate needs, easily extensible, and not an immediate liability in terms of reliability.

Unlock Protocol is essentially a factory smart contract that allows entities to create their own contracts; supporting the monetization of their work via issued tokens.

Around these core contracts we have built a suit of components to test hypothesis regarding interest and usability. Ethereum's test and main nets are publicly readable, and depending on the given use case it may be worthwhile to request data from the node directly. However it maybe more prudent to read from a much faster cache. So we created a subgraph allowing us to quickly provided the most relevant data to our proof of concept and ultimately update some of our other components to leverage the subgraph as well.

## Our entities: Locks, Keys, and Key Holders

Leveraging these entities and your knowledge of [GraphQL](https://graphql.org/) you can start answer questions like

- what keys does a key holder have?
- For a given lock, what keys will expire after a given time?

Here is a few to get started:
[The Unlock Protocol Subgraph](https://docs.unlock-protocol.com/tools/subgraph)

Real talk, so what was the proof of concept and what did we build? We built a keychain, a centralized place where people can manage their Unlock KEYS (Nonfungible Tokens ): review, request refunds, etc.

![keychain screenshot](/images/blog/the-graph-blog-post/screenshot.png)

Without a caching layer, requesting this data would have been a bit I/O intensive as it would require the traversal either events or transactions between the user and all of the the locks in the wild.

All in all, we love what the Graph Protocol team is working on. We look forward to contributing the the project and leveraging it more in the future.

What other use cases do you imagine, what would you build?
