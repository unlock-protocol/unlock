---
title: (Un)Locking Decentraland!
subTitle: The metaverse has private clubs too, powered by Unlock!
authorName: Julien Genestoux
publishDate: August 4, 2021
description: We're very excited to introduce the Unlock Decentraland integration! It lets Decentralandd developers easily create private spaces that only users who own a specific NFT can access!
image: https://github.com/thehen/decentraland-unlock-integration/raw/readme/docs/img/demo.gif?raw=true
---

The past 18 months have proven that "real life" is also very much happening online. The **metaverse** has been taking a significantly bigger place in our lives! Among all platforms, [Decentraland](https://decentraland.org/) is one built on top of the Ethereum network. For example, [the parcels are NFT](https://opensea.io/assets/decentraland).

When we started our grants program a few months ago, one of our community members, [Henry](http://www.henryhoffman.com/), reached out. He's a gaming expert and wanted to showcase what it would mean to build a private club in Decentraland. His grant application was approved, and today, we're very excited to show his work: he made it simple for developers to build memberships on their parcels.

Want to try it? Here's a saloon, where only members can enter :) The membership costs 0.1 MANA!

![Enter the saloon](https://github.com/thehen/decentraland-unlock-integration/raw/readme/docs/img/demo.gif?raw=true)

<div style="text-align: center">
<a href="https://play.decentraland.org/?position=39,-64"><img src="https://github.com/thehen/decentraland-unlock-integration/blob/readme/docs/img/playdemo.png?raw=true" alt="Play Unlock Decentraland demo"></a>
</div>

We really love this integration because it shows how versatile the protocol is: memberships are everyone, and the Unlock Protocol makes it easy to deploy them for creators!

## Building your own!

Henry went as far as [creating a 2nd scene](https://github.com/thehen/unlock-decentraland-example-project) that developers can use as a reference implementation. Let's review the code and see how you, a developer, can add a lock to a scene where users are allowed to move!

The first step is to install a npm module to your project.

```shell
yarn add @thehen/decentraland-unlock-integration
```

Then, you need to configure Unlock with the following command (make sure you replace the lock address!).

```javascript
const decentralandLock = new unlock.Lock(
  '0x9625Bc447d23117e22105B77FAC015F6B970f0C0'
)
```

After this, you're ready to handle events and trigger things. In this demo, the door migt be open or closed, based on events triggered in the scene

```javascript
sceneMessageBus.on('openDoor', ({ sender }) => {
  if (!door.isOpen) {
    door.toggle(true)
  }
})
sceneMessageBus.on('closeDoor', ({ sender }) => {
  if (door.isOpen) {
    door.toggle(false)
  }
})
```

Once Unlock is initialized, an event will be triggered indicating whether the current user is indeed a member and the door should be open, or if they are not... In the latter case, we allow the user to purchase a membership when they click on the door!

```javascript
unlock.eventManager.addListener(
  unlock.LockInitialised,
  'unlockInit',
  ({ lock, hasValidKey }) => {
    if (hasValidKey) {
      // already owns key so open the door
      sceneMessageBus.emit('openDoor', {})
    } else {
      // doesn't own key

      // Instantiate Unlock UI object
      const unlockPurchaseUI = new unlock.UnlockPurchaseUI(
        decentralandLock,
        'https://raw.githubusercontent.com/thehen/decentraland-unlock-integration/master/images/unlock-logo-black.png',
        'Unlock lets you easily offer paid memberships to your \n website or application. \n It is free to try! Just click "purchase" below.'
      )

      // Show UI when cube is clicked
      door.addComponent(
        new OnClick(
          () => {
            unlockPurchaseUI.show()
          },
          {
            button: ActionButton.ANY,
            showFeedback: true,
            hoverText: 'Unlock Door',
          }
        )
      )
    }
  }
)
```

Finally, if the purchase is succesful, we open the door, letting the user in:

```javascript
unlock.eventManager.addListener(
  unlock.PurchaseSuccess,
  'purchase success',
  ({ lock }) => {
    sceneMessageBus.emit('openDoor', {})
  }
)
```

You can find all of the code [detailed above in this file](https://github.com/thehen/unlock-decentraland-example-project/blob/269d877be2993aca4693ab05c969652f891724a5/src/game.ts).

## Unlocking games!

In a game, a membership can let the user access specific private spaces, like a saloon, a concert, a lecture… etc, but they can also let users unlock features or particular features.

We're really excited to see what developers can build on top of this integration! And one that we're interested in beyond this is the idea that a single membership can be used by multiple games or even entirely outside of games. For example, someone could set up a Discord server that uses the same membership and create member-only channels mapped to the games' memberships!

## Your turn!

The Unlock protocol is a protocol for memberships that is collectively governed through our governance token UDT. Unlock Inc. distributes some of the pre-mined tokens in the form of grants.

Like Henry, you can [apply for a grant to receive UDT](https://share.hsforms.com/1gAdLgNOESNCWJ9bJxCUAMwbvg22?__hstc=157293157.a64577003debff883e378fbdfc5fa3ab.1627501869513.1627659020947.1627979313219.4&__hssc=157293157.2.1627979313219&__hsfp=1354805476)!

<iframe width="100%" height="410" src="https://www.youtube.com/embed/q3kPUXdDr80" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
