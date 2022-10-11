---
title: Unlock Adds OpenAPI Support And Typescript Client For Locksmith
authorName: searchableguy
publishDate: October 11, 2022
description: Explore all our APIs and play around with the locksmith client.
image: images/blog/open-api-support/docs.png
---

Locksmith is our backend service. It is used for handling metadata, ticketing, processing payments, [unlock accounts](https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/unlock-accounts/) and other features on our frontends.

Many developers have asked for documentation and tooling to interact with it to build applications or automate various tasks such as updating metadata in bulk, adding ticket verifiers, and more. We can’t cover all of these use cases on our frontend without increasing complexity so, we are releasing [OpenAPI](https://www.openapis.org/) spec for our endpoints and a client SDK in `unlock-protocol/unlock-js`

Our docs site is also updated to show endpoints relevant to developers with examples and usage.

![docs site](images/blog/open-api-support/docs.png)

Here is an example of how you can use the new locksmith service client. It is fully typed so you will get intellisense for arguments and responses in your editor.

```tsx
import { LocksmithService } from '@unlock-protocol/unlock-js'

const service = new LocksmithService()

async function main() {
  // Get unlock address balance on each network
  const balanceResponse = await service.balance()
  console.log(balanceResponse)
  // Get keys metadata on goerli.
  const keysResponse = await service.keysMetadata(
    5,
    '0xCE62D71c768aeD7EA034c72a1bc4CF58830D9894',
    '1'
  )
  console.log(keysResponse)
}

main()
```

Note: It is experimental so expect breaking changes until `@unlock-protocol/unlock-js` reaches v1.x.

For languages other than javascript, you can use our [OpenAPI spec](https://github.com/unlock-protocol/unlock/blob/master/packages/unlock-js/openapi.yml) and generate a client using [OpenAPI generator](https://openapi-generator.tech/).

If you have any feedback or find outdated [OpenAPI spec](https://github.com/unlock-protocol/unlock/blob/master/packages/unlock-js/openapi.yml) for any of our public endpoints, please open an issue on Github.
