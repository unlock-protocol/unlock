---
title: Webflow Integration
subTitle: Why its awesome and how to integrate with Webflow
authorName: Sascha Mombartz
publishDate: May 26, 2021
description: A brief 
image: /static/images/blog/hellooptimisticunlocking/hero.jpg
---
![Webflow](/static/images/blog/webflow-integration/webflow-home-hero.png)

As a designer I love Webflow. It combines powerful design tools with no hassle CSS, responsive layouts and great cross-browser compatibility. All this lets the technical aspects fade into the background and lets me focus on the design and the user experience. On top of that it also offers a huge amount of flexibility and custom integrations.

When I looked into integrating Unlock I had a feeling it would be possible but I got super excited when I realized how easy it was. Integrations like these take Webflow from a basic web creation tool towards a much more robust no code and web app platform. It's really awesome to see how you can integrate  a decentralized and permissionless membership on top of your website.

One thing you'll need for the configuration is a lock that you can create on the Unlock dashboard -- it's very straightforward. For more info check out this article in [our docs](https://docs.unlock-protocol.com/creators/deploying-lock).
The integration process is straightforward: You start with embedding Unlock's paywall, configuration, event handler and trigger scripts and then adding a few lines of css to control the visibility. All of this is copy and pasting, and shouldn't take longer than 5 to 10 minutes. The final step is to add specific selectors/classes to your elements. Check out [the demo](https://unlock-integration.webflow.io/) and more detailed instructions below and [on the integration site](https://unlock-integration.webflow.io/instructions). You can also clone the project from the [showcase page](https://webflow.com/website/Integrating-Unlock).

![Webflow Selector Panel Locked](/static/images/blog/webflow-integration/webflow-selector-locked.png)

It starts to get really interesting when you start using it with dynamic and CMS content -- check out the [blog example](https://unlock-integration.webflow.io/blog) for that.

Because Unlock is open-source and a protocol the options and opportunities are endless depending on how simple or complex you want to keep things on your end (and your dev skills 😉). Integrating Unlock or want to build something awesome? Let us know! We also have a [grant program](https://docs.unlock-protocol.com/governance/grants-bounties-and-matchings) for Unlock integrations and great use cases.

# How To

There are 3 parts to integrating the Unlock Paywall App

1. The Content
2. Checkout Initiation
3. Paywall Integration: Script, Config, Handler, CSS

## 1. The Content

Unlock uses three classes in the selector panel to define content
`unlock-content`, `unlocked`, `locked`.

The way Unlock works is it checks for the unlock-content and then hides the content blocks that have theunlocked class and shows the ones with thelocked class.

What you'll have to do is create two version of the content – one thats unlocked and visible to non members and a one thats locked and only visible to members.

Let's look at two examples, one using native webflow elements the other using an embed element.

**Public Element**
This section is visible when the content is locked, hence it has the `locked` class set.

![Webflow Selector Panel Locked](/static/images/blog/webflow-integration/webflow-selector-locked.png)

**Private Element**
This is for members only and needs to be unlocked, hence it has the `unlocked` class set

![Webflow Selector Panel Locked](/static/images/blog/webflow-integration/webflow-selector-unlocked.png)

## 2. Checkout Initiation

The link and button that bring up the Unlock paywall are also special and they both embed elements with custom code.

**Button**
<script width="100px" src="https://gist.github.com/smombartz/c36a6a479e188dbee13b9150aad1d6db.js"></script>

**Link**
<script src="https://gist.github.com/smombartz/4c3fb7027189366ba5e916591d836431.js"></script>

## 3. Paywall Integration

You need to add the Paywall Script, Paywall Configuration, Event Handler and Unlock CSS to the Head Code in the Custom Code section of your site which you can access from the the the head section of your website. You can find all of the code that needs to go into the head here.

**Paywall Script**
<script src="https://gist.github.com/smombartz/a50e9907b5b0ef6fe45b415608c710f5.js"></script>

**Paywall Configuration**
<script src="https://gist.github.com/smombartz/1f6f6a3665712f0451fc01f460c9a73c.js"></script>

**Events Handling**
<script src="https://gist.github.com/smombartz/7ad643db152a48391e5c1f9f667febb8.js"></script>

**CSS**
<script src="https://gist.github.com/smombartz/a3744bb52e2ba31e11f1bd068b47ebda.js"></script>

## Done

Want to play around with the code? You can  clone the project from the [showcase page](https://webflow.com/website/Integrating-Unlock) or experiment in [this JSFiddle](https://jsfiddle.net/smombartz/kjrq5asg/10/).