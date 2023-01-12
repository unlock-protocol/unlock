---
title: What is Sign-In with Ethereum?
subTitle: Sign-In with Ethereum is a new standard form of authentication
authorName: Iniubong Obonguko
publishDate: March 24, 2022
description: Sign-In with Ethereum is a new standard form of authentication that enables end-users to access resources on the internet using their Ethereum account.
image: /images/blog/siwe-blog/siwe-header.png
---

![siwe-header.png](/images/blog/siwe-blog/siwe-header.png)

## What is Sign-In with Ethereum?

In simple terms, Sign-In with Ethereum is a new standard form of authentication that enables end-users to access resources on the internet using their Ethereum account instead of relying on traditional authentication providers such as Google, Facebook, and the like.

According to the [EIP-4361 standard](https://eips.ethereum.org/EIPS/eip-4361), the Sign-In with Ethereum specification "describes how Ethereum accounts authenticate with off-chain services by signing a standard message format parameterized by scope, session details, and security mechanisms (e.g., a nonce). The goals of this specification are to provide a self-custody alternative to centralized identity providers, improve interoperability across off-chain services for Ethereum-based authentication, and provide wallet vendors a consistent machine-readable message format to achieve improved user experiences and consent management."

## Why does Sign-In with Ethereum matter?

Historically, websites, web applications, and mobile apps not built with blockchain technology relied on centralized identity providers with centralized control over users' information. In most cases, these centralized identity providers were the only existing authentication infrastructure and were convenient to end users.

For example, Google provides you with an email address to send emails and sign up for services on the internet. In return, you agree to provide them with data they can use to tweak their algorithms to track you, serve you ads and [subconsciously influence your decisions](https://knowledge.wharton.upenn.edu/article/algorithms-decision-making/). Google, Facebook, and others similarly provide identity services "for free," in exchange for keeping their users reliant on their silos.

A key question needs to be raised. What then happens to user data in the event of a data breach at one of these centralized services with millions of customers? Or what happens if a user simply wants to cut the cord with one of these centralized entities?

Enter "Sign-In with Ethereum."

The new Sign-In with Ethereum standard eliminates uncertainties about who has access to your private information, your digital footprint, and so on. Since the blockchain powers it, the Sign-In with Ethereum standard by default was designed with decentralization in mind.

## How is Sign-In with Ethereum different from current approaches?

The Sign-In with Ethereum authentication method differs from current centralized approaches because it is based on a new self-custodial option for internet users who wish to assume more control and responsibility for their own digital identity. (“Self-custody” means that you and only you have possession of your digital assets and only you control the private key. This also comes with a great deal of responsibility — you are responsible for safeguarding access to your private key because it is not stored anywhere else.)

Already, many services support workflows to authenticate identity using Ethereum accounts by way of message signing. With Sign-In with Ethereum, there is an opportunity to standardize the sign-in flow and improve interoperability across existing services while also providing wallet vendors a reliable method to identify signing requests.

## How to integrate with Unlock

Sign-In with Ethereum is the future of user authentication for the ".eth" era, and an increasing number of blockchain-tech companies have implemented their versions of the EIP-4361 standard, including Unlock Protocol.

Unlock Protocol recently announced their implementation of the EIP-4361 standard by updating [their documentation](https://docs.unlock-protocol.com/unlock/developers/sign-in-with-ethereum) and in [this blog post](https://unlock-protocol.com/blog/sign-in-with-ethereum) by its founder Julien Genestoux.

Until now, the act of prompting users for their wallet address to authenticate them was quite an arduous development process as there are many wallet providers; asking users to connect their wallets to your application requires the implementation of multiple APIs and approaches.

Unlock offers an easier way to implement the Sign-In with Ethereum authentication method with a few lines of code.

Unlock has created a flow similar to the popular OAuth flow that users are familiar with. When the user has signed the message, they get redirected to the application. The redirect URL contains a code that the developer can decode to retrieve the user's information. If the user also does not have a wallet address, they can sign up using Unlock.

Unlock does all the heavy-lifting, so developers can focus on building what matters.

Here’s how you can implement Sign-in with Ethereum into your application.

![iniubong-final.gif](/images/blog/siwe-blog/iniubong-final.gif)

We'll use Vue.Js for this demo and Tailwind for styling, but the concepts explained here can be replicated in any other framework.

> 💡 Editor's note: Please practice good code hygiene on any code or links you access on any website, including this one. Code samples referenced here may have changed after publication of this blog post, so please review them carefully before copying or implementing.

You can find all the code for this demo in the CodeSandbox below. Feel free to fork and tweak the code as you wish.
[https://codesandbox.io/embed/smoosh-dream-urw2qt?fontsize=14&hidenavigation=1&theme=dark](https://codesandbox.io/embed/smoosh-dream-urw2qt?fontsize=14&hidenavigation=1&theme=dark)

To get started, we need to create a Sign-In link with our application's URL as such:

```
https://app.unlock-protocol.com/checkout?client_id=urw2qt.csb.app&redirect_uri=https://urw2qt.csb.app
```

Just replace `urw2qt.csb.app` with your URL. Here, I'm using the link to the app generated by [CodeSandbox](https://urw2qt.csb.app).

For this to work, both `client_id` and `redirect_uri` are required fields, and the `client_id` field must match the host part of the `redirect_uri` for security reasons.

When the user clicks on the Sign-In link from our application, they get prompted to connect their wallet through whichever means they prefer. Once successfully connected, they will also be redirected to the application, this time with an extra query parameter. The value of this parameter is base64 encoded and can be decoded by your application to retrieve the signature message and the signed message. Using these two values, you can retrieve the address of the signer.

If the user refuses to connect and sign a message in their wallet, they get redirected back to the `redirect_uri`, and a new query string parameter is attached `?error=access-denied`.

## Too easy, right? That's the power of Unlock.

For more information on implementing Sign-In with Ethereum, visit the [official documentation](https://docs.unlock-protocol.com/unlock/developers/sign-in-with-ethereum).

_This blog post is a guest post from Iniubong Obonguko. Iniubong is a frontend web developer & technical writer. You can read his blog [here](https://blog.iniubongobonguko.com/)._
