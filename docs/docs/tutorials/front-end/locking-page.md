---
sidebar_position: 1
description: >-
  Once created, you need to embed your lock(s) in your web page or application.
  There are many ways to do this, but the easiest way is to use our Paywall
  application.
---

# Adding a Lock to Web Page

Adding a lock to any webpage is simple, using [Unlock's Paywall application](https://paywall.unlock-protocol.com/). Note that the Unlock Community has built integrations for Content Management Systems or other applications (such as chat messaging applications, e-commerce stores or, even gaming engines!). See the [_Plugins and Integrations_](https://unlock-protocol.com/guides/category/plugins/) section.

## Embedding the paywall

The first part of this requires embedding a script on the web page where the lock should be installed. You need to achieve this in the `​<head>` section of the HTML body. The script to be loaded is located at the following address: `https://paywall.unlock-protocol.com/static/unlock.latest.min.js`

:::caution

If you are looking for a way to use the legacy unlock checkout, append `legacy=true` as query in the paywall script src url.

:::

We recommend loading the script using the following approach:

```javascript
<script>
(function(d, s) {
  var js = d.createElement(s),
    sc = d.getElementsByTagName(s)[0];
  js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";
  sc.parentNode.insertBefore(js, sc); }(document, "script"));
</script>
```

## Configure the Paywall

The second step required is to configure the paywall so that it uses your lock.
There again, you will need to use a `<script>`element added to your page's HTML.
Ideally, it should also be placed in the ​`<head>`​ section and will let you
configure the behavior of the paywall.

The Paywall actually invokes one of our other tools ["Checkout"](../../tools/checkout)
and the configuration you build here is the same JSON object you build for
configuring the Checkout.

Please see this section on [how to build the configuration](../../tools/checkout/configuration.md).

```javascript
<script>
  var unlockProtocolConfig ={' '}
  {
    // paywallConfig object
  }
</script>
```

Important: `​unlockProtocolConfig​` is a global object (it should be defined on the `window` object).

## Handle Events

Once loaded the unlock script will trigger events on the page’s ​`window`​ object.
These events let your web application adjust its behaving or the content it displayed based on the status. For a full list see [Paywall documentation](/../../tools/checkout/paywall).

Here is an example:

```javascript
window.addEventListener('unlockProtocol.status', function (e) {
  var state = e.detail
  // the state is a string whose value can either be 'unlocked' or 'locked'...
  // If state is 'unlocked': implement code here which will be triggered when
  // the current visitor has a valid lock key
  // If state is 'locked': implement code here which will be
  // triggered when the current visitor does not have a valid lock key
})
```

_Note_: the callback can be invoked several times. For example, a visitor might purchase a key while they are on the page, going from the `locked` to the `unlocked` state. Similarly, the key that the visitor owns may expire during a visit which would result in the state going from `unlocked` to `locked`.

### Modal Closing

- Event Name: `unlockProtocol.closeModal`

This event gets triggered when the modal is closed by the user. It does not give any information about the status of the user specifically. For that you would need to use the `unlockProtocol.status` highlighted above.

## Initiate Checkout

In order to purchase keys, Unlock provides a modal that lets the user pick the lock of their choice (based on [the configuration](../../tools/checkout/configuration)). The modal can be loaded by invoking the following:

```javascript
window.unlockProtocol &&
  window.unlockProtocol.loadCheckoutModal(/* optional configuration*/)
```

In some cases, you may want to customize what locks are available for purchase, or even the messaging. For this, the `loadCheckoutModal` call accepts an optional configuration object. This configuration object has the same shape as the global `unlockProtocolConfig`

## Full code example

You can easily configure the following with your lock by replacing the lock address and setting up a network if your lock is not on the main network.

<iframe style={{
  width: "100%",
  height: "500px",
  borderRadius: "6px"
}} scrolling="no" title="Unlock Sample" src="https://codepen.io/unlock-protocol/embed/bGWZvGM?default-tab=html%2Cresult&editable=true" frameborder="no" loading="lazy" allowTransparency="true" allowFullscreen="true">
</iframe>

## More examples

### Ad-free experience

You can easily use the approach detailed above to create an ad-free experience on your own site.

Once you have [deployed a lock](https://unlock-protocol.com/guides/how-to-create-a-lock/), add the Unlock paywall application JavaScript to your page (see above) and configure it.

Finally, add an event handler to capture the change of state between `locked` and `unlocked`; rendering ad components when relevant.

```javascript
window.addEventListener('unlockProtocol', function (e) {
  var state = e.detail

  if (state === 'locked') {
    // load ad rendering component here
  } else {
    // current visitor is a member, do not load ads!
  }
})
```

While some tailoring may be required for your specific use case, this should provide a starting point towards utilizing the Unlock Protocol to provide your members with an Ad Free experience.

### Locking Media Content

We use the same approach again to lock media content (images, videos... etc). Here is an example of how to achieve this. We want to lock up access to [this video](https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4).

HTML5 actually makes it very easy to embed any video in a document. Here's what it takes:

```markup
<video controls>
  <source src="https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4" type="video/mp4">
</video>
```

For any web page which includes a lock, we use the same approach. First, we load the Paywall script, and then, we set the configuration for it (see above).

JavaScript provides us with an API to control the video. We can use that to lock its access. The following sample provides details of how this can work. Note there are multiple ways of doing this; feel free to tinker around!

```bash
<script>
(function() {
  // Set a few default variables.
  let isUnlocked = true;
  const previewTime = 30;

  window.addEventListener('unlockProtocol.status', function(e) {
    var unlock = e.detail
    isUnlocked = (unlock.state === 'unlocked')
    // Optional: call video.play() to resume the video!
  })


  // This assumes there is a single video on the page. Otherwise use class selectors.
  const video = document.querySelector('video');
  video.addEventListener('timeupdate', (event) => {
    // This event gets triggered every time there is an update in the current time.
    // If the video is locked and the time is above previewTime seconds
    if (!isUnlocked && video.currentTime > previewTime) {
      // We stop the video go back to previewTime and pause the video
      video.currentTime = previewTime
      video.pause()
      // We ask the user to get a membership by loading the checkout UI
      unlockProtocol.loadCheckoutModal()
    }
  })
})();
</script>

```

After this, you are all done!

_**Note:** This tutorial implements a front-end locking approach, which is possible to circumvent; a determined actor could tinker with the JavaScript console of their web browser and inspect the code to find a workaround. It is absolutely possible to address this using an approach that is more difficult to circumvent, but that requires a back-end integration, which is more advanced and is outside the scope of this tutorial._
