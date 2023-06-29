---
title: 🔒 Introducing Unlock Authentication Modal for Seamless User Login and Library Integration
subTitle: Developers can now integrate the Unlock authentication modal into their applications to enable users to login without building their own login modal.
authorName: searchableguy
publishDate: June 28, 2023
description: Developers can now integrate the Unlock authentication modal into their applications to enable users to login without building their own login modal.
image: /images/blog/unlock-authentication-modal/main.png
---

![](/images/blog/unlock-authentication-modal/main.png)

We're excited to announce the addition of unlock authentication modal which can be used through the paywall library to login users without building your own login modal.

Take a look at the example below.

```typescript
import { Paywall } from '@unlock-protocol/paywall'
import { networks } from '@unlock-protocol/networks'

const paywall = new Paywall(networks)
// Now, you can utilize the provider for tasks such as signing messages and sending transactions.
const provider = paywall.getProvider()
await provider.connect() // This step will initiate the login modal
```

To delve deeper into integrating the provider seamlessly within your application using "wagmi", we have prepared a [comprehensive tutorial](https://docs.unlock-protocol.com/tutorials/front-end/paywall/provider/).

Stay tuned for more updates as we continue to enhance our authentication features and empower developers and users alike with seamless access to our application.
