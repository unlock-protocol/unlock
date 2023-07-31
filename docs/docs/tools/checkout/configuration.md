---
title: Configuration
description: >-
  When building a checkout URL or configuring the paywall, you can customize
  things. Here are docs on how to achieve this.
sidebar_position: 1
---

# Configuring Checkout

## Building your URL

All of the purchase URLs start with the following base

```
https://app.unlock-protocol.com/checkout?
```

After this, you will need to include the following parameters:

- `paywallConfig=...` where `...` is replaced with the URL-encoded version of a JSON `paywallConfig` object. The next section will show you how to build this object.
- `redirectUri=...` where `...` is replaced with the URL-encodded address of a webpage where the user will be redirected when their membership is valid.

These parameters are all separated by the `&` sign and you can use online tools such as [https://www.urlencoder.io/](https://www.urlencoder.io/) to build the encoded version of the parameters.

### Example

```text
https://app.unlock-protocol.com/checkout?redirectUri=https://ouvre-boite.com&paywallConfig=%7B%22locks%22%3A%7B%220x15F67811Beb43aCE162693fe1415916F87B8C5C2%22%3A%7B%22network%22%3A137%7D%7D%2C%22persistentCheckout%22%3Atrue%2C%22icon%22%3A%22https%3A%2F%2Frinkeby.locksmith.unlock-protocol.com%2Flock%2F0x15F67811Beb43aCE162693fe1415916F87B8C5C2%2Ficon%22%7D
```

This URL will redirect members to this page [`https://ouvre-boite.com/`](https://ouvre-boite.com/).

## The paywallConfig object

The `paywallConfig` is a JSON object which includes a set of customizations for your experience. It includes the following elements:

- `locks` : _required object_, a list of lock objects ([see below](#locks)).
- `title`: _optional string_, a title for your checkout. This will show up on the head.
- `icon`: _optional string_, the URL for a icon to display in the top left corner of the modal.
- `persistentCheckout`: _optional boolean_: `true` if the modal cannot be closed, defaults to `false` when embedded. When closed, the user will be redirected to the `redirect` query param when using a purchase address (see above).
- `referrer`: _optional string_. The address which will [receive UDT tokens](../../governance/unlock-dao-tokens) (if the transaction is applicable)
- `messageToSign`: _optional string_. If supplied, the user is prompted to sign this message using their wallet. If using a checkout URL, a `signature` query param is then appended to the `redirectUri` (see above). If using the embedded paywall, the `unlockProtocol.authenticated` includes the `signature` attribute.
- `pessimistic`: _optional boolean_ defaults to `false`. By default, to reduce friction, we do not require users to wait for the transaction to be mined before offering them to be redirected. By setting this to `true`, users will need to wait for the transaction to have been mined in order to proceed to the next step.
- `hideSoldOut`: _optional boolean_ defaults to `false`. When set to true, sold our locks are not shown to users when they load the checkout modal.
- `expectedAddress`: _optional string_. If set, the user will be asked to switch their wallet address before proceeding. This is useful if you want to ensure that the user is using the same address as the one they used to purchase a membership.

- `skipSelect`: _optional boolean_. Skip selection screen if only single lock is available.

### Locks

The locks object is a list of objects indexed by the lock address, where each object can include the following:

- `network`: _recommended integer_. See below.
- `name`: _optional string_. name of the lock to display.
- `recurringPayments`: optional number. The number of time a membership should be renewed automatically. This only applies to ERC20 locks.
- `metadataInputs`: _optional array_, a set of input fields [as explained there](./collecting-metadata.md).
- `minRecipients`: _optional number_, set the minimum number of memberships a user needs to purchase.
- `maxRecipients`: _optional number_, set the max number of memberships a user can purchase. Note: By default, checkout doesn't allow fiddling with quantity. You have to set maxRecipients to allow for changing to quantity.
- `emailRequired`: _optional boolean_. Defaults to `false`. If set to `true`, the user will be prompted to enter an email which will be stored as metadata and be visible to any lock manager.
- `captcha`: _optional boolean_. defaults to `false`. If set `true`, the users will be prompted to go through a captcha during the checkout process. This is better used in conjunction with a purchase hook that verifies that captcha is valid.
- `password`: _optional boolean_. Defaults to `false`. If set to `true`, the user will be prompted to enter a password in order to complete their purchases. This will only be useful if the lock is connected to a hook that will handle the [password verification](../../tutorials/smart-contracts/hooks/using-on-key-purchase-hook-to-password-protect.md).
- `dataBuilder`: _optional url_. If set to a url, checkout will call the URL through a proxy with `recipient`, `lockAddress`, and `network` field for a json response containing data _string_ field. This will be passed to the purchase function when user is claiming or buying the key as is. Make sure the returned data is valid bytes.
- `skipRecipient`: _optional boolean_. Skip recipient screen if max recipients is 1.

### Network values

Make sure you use a number and not a string! For the complete list check our
[networks](../../core-protocol/unlock/networks) page.

### Full example

```javascript
{
    "pessimistic": true,
    "locks": {
        "0x250a0153DfB52B44c560524283A6629C1d347545": {
           "network": 1,
           "name": "Unlock members"
        }
    },
    "icon": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.10UUFNA8oLdFdDpzt-Em_QHaHa%26pid%3DApi&f=1",
    "metadataInputs": [
        {
            "name": "Name",
            "type": "text",
            "required": true
        }
    ]
}
```
