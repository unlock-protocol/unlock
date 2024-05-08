---
title: React + Unlock Protocol
description: How to use Unlock Protocol in a React.js app.
---

# React + Unlock Protocol

To get you started working with Unlock Protocol in a react frontend we’ve created a starter kit for your convenience.

## Prerequisites

This tutorial assumes a beginner level understanding of HTML, CSS, JavaScript ES6, Git and React

## Additional Resources

- [React](https://reactjs.org/tutorial/tutorial.html)
- [freeCodeCamp](https://www.freecodecamp.org/learn/front-end-development-libraries/#react)
- [w3schools](https://www.w3schools.com/REACT/DEFAULT.ASP)
- [TutorialsPoint](https://www.tutorialspoint.com/reactjs/index.htm#)
- [Ibaslogic](https://ibaslogic.com/react-tutorial-for-beginners/)

## Creating your repo

We have already created a base [react-example](https://github.com/unlock-protocol/react-example) repo which you can use. Bootstrapped with Create React App so it comes with the tooling you expect to get started quickly.

Most of the time you will want to fork this repo as a place to get started. If you’d like to pull in future changes or contribute back make sure you take the additional steps to sync your fork with the original. If you’re unsure about your workflow then I would suggest consulting the Github guide Working with forks to see if that is right for you.

### Creating your fork

1. Navigate to the [react-example](https://github.com/unlock-protocol/react-example) Github repository.
1. In the top-right corner of the page, click Fork.
   ![fork button][fork button]
   [fork button]: /img/tutorial/react-example-fork_button.png

### Cloning your fork

1. Navigate to your fork of the repository you just made.
1. Above the list of files, click Code button.
   ![download code button][download code]
   [download code]: /img/tutorial/react-example-code_button.png
1. Copy the URL for the repository.
   ![clone button][clone button]
   [clone button]: /img/tutorial/react-example-https_url_clone_cli.png
1. To clone the repository using HTTPS, under "HTTPS", click paste button highlighted above.
1. Open Terminal.
1. Change the current working directory to the location where you want the cloned directory.
1. Type git clone, and then paste the URL you copied earlier. It will look like this, with your GitHub username instead of YOUR-USERNAME:

```terminal
$ git clone https://github.com/YOUR-USERNAME/react-example
```

1. Press Enter. Your local clone will be created.

```terminal
$ git clone https://github.com/YOUR-USERNAME/Spoon-Knife
> Cloning into `Spoon-Knife`...
> remote: Counting objects: 10, done.
> remote: Compressing objects: 100% (8/8), done.
> remove: Total 10 (delta 1), reused 10 (delta 1)
> Unpacking objects: 100% (10/10), done.
```

## Configuration

### Unlock Paywall

Currently the app utilizes the latest version of the [Unlock Paywall](https://docs.unlock-protocol.com/tools/checkout/paywall/) but you only need to change the link in the index.html to specify a specific version if that is what you need. We are dedicated to pushing breaking changes to a new url for the [Unlock Paywall](https://docs.unlock-protocol.com/tools/checkout/paywall/) so you shouldn't fear leaving it on latest.

In the public/index.html you will find an Unlock configuration object.

```JavaScript
<!-- Unlock Configuration -->
<script>
  var unlockProtocolConfig = {
      "network": 100, // Network ID (1 is for mainnet, 100 for xDai, etc)
      "locks": {
        "0xac1fceC2e4064CCd83ac8C9B0c9B8d944AB0D246": {
          "name": "Unlock Members"
        }
      },
      "icon": "https://unlock-protocol.com/static/images/svg/unlock-word-mark.svg",
      "callToAction": {
        "default": "Please unlock this demo!"
      }
    }
</script>
```

There are many different configuration options for the [Unlock Paywall](https://docs.unlock-protocol.com/tools/checkout/paywall/) and the complete documentation for those options can be found [here](https://docs.unlock-protocol.com/tools/checkout/paywall/configuring-checkout/).

### Unlock Event Listeners

You'll find we've added special event listeners in the src/App.js file. This is a very basic example which changes the visible content on a page when a user finishes the checkout or already has a key in their wallet and the state changes from "locked" to "unlocked".

## Starting the app

Make sure you have all the packages installed

```terminal
$ npm install
```

As long as you have all the packages installed then to start the app in development mode

```terminal
$ npm start
```

This should launch a browser window for you at http://localhost:3000 automatically but you can also just click the link to if it doesn’t. You should have a screen that looks like.
