---
title: Firebase integration
subTitle: You can now easily add an Unlock membership to any Firebase application
authorName: Julien Genestoux
publishDate: Sept 2, 2021
description: The team at Novum Insights has received a grant to build a Firebase integration to let any developer on that platform easily integrate a membership in their application!
image: /images/blog/firebase/firebase.png
---

Every single application, whether it is built for the web, for mobile devices, or computer can be monetized with Unlock! Memberships are an elegant way to restrict access to some content, features or even APIs. Today, we're excited to showcase the work of the [Novum Insights](https://novuminsights.com/) team who have shipped a integration of Unlock with [Firebase](https://firebase.google.com/)!

Firebase is a platform developed by Google for creating mobile and web applications. It is a framework which includes both server and client sides components for easy development and deployments.

David Layton, from the Novum Insights team built an integration between Unlock and Firebase.

## High level developer flow

The first step is to install the [NPM package](https://www.npmjs.com/package/@novuminsights/unlock-protocol-firebase) for the integration `@novum/unlock-firebase-integration`, then your application needs to authenticate its users by requesting users to sign a message. The backend will then **map** a Firebase Authentication user with their Ethereum wallet.

```javascript
import "firebase/auth"
import "firebase/functions"
import {signInWithWeb3} from '@novum/unlock-firebase-integration/lib/browser'

const app = firebase.initializeApp(firebaseConfig);
const signInButton = document.querySelector('#MyButton')
signInButton.onclick = () => signInWithWeb3(app);
```

Finally, once the users are mapped to their wallet you can easily configure your application to behave differently based on which locks the users have unlocked!

You can define these using a configuration file `unlock-integration.config.json` which maps lock addresses to _roles_ like that:

```javascript
{
    "networks": {
        "mainnet": {
            // ...
            "locks": {
                "0x361Ddf540e27632D80dDE806EAa76AC42A0e15F6": ["basic_subscription"]
            }
        },
    },
}
```
In that example, any user who has a valid membership to the lock `0x361Ddf540e27632D80dDE806EAa76AC42A0e15F6` will have the role `basic_subscription`

Finally you can alter the behavior of your application on the front-end or backend using the `context.auth` object.

```javascript
async function hasBasicSubscription(context) {
    const auth = context.auth;
    /// ...
    return auth.token.basic_subscription === true;
}
```


Check the [Unlock Firebase integration docs](https://david-layton.gitbook.io/novum/) for more info!

## A Novum Insights membership!

Novum Insights is a powerful DeFi tool that lets investors identify **Momentum Pairs** of crypto tokens. Novum Insights is now offering an Unlock based membership that uses their Firebase integration! Right now, they have a 1 year limited edition for Eth 0.04 (50% off!)

Get [your Novum Membership today](https://novuminsights.com/)!


