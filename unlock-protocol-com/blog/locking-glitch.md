---
title: 'Locking Glitch'
authorName: Julien Genestoux
publishDate: March 17, 2020
description: Glitch is a modern web development tool which lets you build fast, full-stack web apps in your browser. Here's how to add locks to these applications!
image: /images/blog/locking-glitch/glitch.png
latestUpdateDate: April 6, 2020
---

[Glitch](https://glitch.com/) is a modern web development tool wich lets you build fast, full-stack web apps in your browser. It's not only a developer tool which can prove very useful for prototyping applications very fast, but can also be used to actually host these applications.

In this article, I will show you how to easily add a lock to a Glitch application to monetize it! First, [try the application](https://unlock-example.glitch.me/), or check the embedded version below! You can click on the Fishes in the top right corner to <em>View Source</em> or <em>Remix on Glitch</em>, if you want to edit the code (it's a great way to start building your own application!).

<div class="glitch-embed-wrap" style="height: 486px; width: 100%; margin-bottom: 50px">
  <iframe
    allow="geolocation; microphone; camera; midi; encrypted-media"
    src="https://glitch.com/embed/#!/embed/unlock-example?previewSize=100&previewFirst=true&sidebarCollapsed=true"
    alt="unlock-example on Glitch"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>

Let's start by clicking on the **View Source** button. Use the little ▶️ button in the top right corner to view the list of files. Our application is very trivial and includes the following files `index.html`, `index.js`, `style.css` and `unlock.js`.

# Index.html

The `index.html` file includes the markup which is displayed by the web browser, as well as "loads" the other relevant files, such as the styles from the `style.css` file and the JavaScript code from both `index.js` and `unlock.js`.

The markup on the page includes 3 important elements. They all have the class `unlock-protocol`. We will use this class in our script to identify what needs to be shown or hidden based on the status of the visitor (member or not!).

1. The first paragraph with the class `loading` acts as a placeholder and it will only be visible while the rest of the page is being loaded.

```
<p class="unlock-protocol loading">
  Loading!
</p>
```

2. The second paragraph is hidden by default (see `style="display:none"`), and has the class `unlocked`. This one will be only shown when the visitor is a member.

```
<p class="unlock-protocol unlocked" style="display:none">
  Thanks for being a member ;)
</p>
```

3. The 3rd paragraph is also hidden by default, but this time it has the class `locked`, which means it will be shown when the visitor is not a member. That's in this paragraph that we will add a button for the user to purchase their membership, through the `unlockProtocol.loadCheckoutModal()` method.

```
<p class="unlock-protocol locked" style="display:none">
  <button onclick="window.unlockProtocol.loadCheckoutModal()">
    Please, become a member now!
  </button>
</p>
```

# Unlock.js

Let's now look at the `unlock.js` script. This script has several purposes:

1. It loads the unlock paywall application

```
// Load Unlock
var js = document.createElement("script")
sc = document.getElementsByTagName("script")[0]
js.src="https://paywall.unlock-protocol.com/unlock.latest.min.js"
sc.parentNode.insertBefore(js, sc)
```

2. It configures the behavior of the paywall application

```
// Configure Unlock
var unlockProtocolConfig = {
  locks: {
    '0xCE62D71c768aeD7EA034c72a1bc4CF58830D9894': {
      network: 100,
    },
  },
}
```

3. And finally, it handles the events to show or hide elements based on the state of the visitor. By default, it hides all elements with the `unlock-protocol` class, and just shows the ones which are relevant to the event which was emitted.

```
// Handle unlock events to hide/show element based on state
window.addEventListener('unlockProtocol', function(e) {
  var state = e.detail

  document.querySelectorAll('.unlock-protocol').forEach((element) => {
    element.style.display = 'none';
  })
  document.querySelectorAll(`.${state}`).forEach((element) => {
    element.style.display = 'block';
  })
})
```

That's it!

# What are you building?

Unlock should be a very small part of any application because it is just about _access control_. What your application grants to users is completely up to you! Here are a few applications which you might be interested in looking at:

- A [chat room application](https://ethcc-chat.glitch.me/) where only members can participate! I built this application for [EthCC](https://ethcc.io/) to show how easy to re-use a locks used to sell tickets in a different context!
- A [locked Typeform](https://locked-typeform.glitch.me/). Typeform is an application which lets you build surveys and forms. This example shows how you can build a way to collect information only from your members!

What would you build?
