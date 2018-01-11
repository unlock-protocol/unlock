# Repositoty for the code to run Unlock

5 steps to POC

1. Working JS snippet which can be embedded on a webpage and will erase the content of the page of the current user is not allowed to view it.
2. Accept "slow" blockchain transaction to unlock content, maybe using Metamask.
3. Replace Metamask with our own iframe.
4. Fast payment channel to unlock content.
5. Accept CC payment.


## Components

### JS snippet (Button)

The JS snippet can be embedded on any webpage and provides a small set of API which locks and unlocks content on that page, based on data loaded from an invisible iframe. Communication with the iframe is achieved thru https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage JS API

### Iframe

This is the "sandboxed" web application which "follows" the user accross the web. It is a modern PWA which stores as much as possible locally in order to avoid network latency and delays. It stores cookies which identify the user.

It behaves very similary to metamask.

### Main Website

Under the same domain as the iframe (it's really the same app), it shares the data and provides a useful UI that lets the user perform payments and view transasction history. This UI should also be used to "sync" data accross multiple user agents. Relies on WebRTC to achieve this.

### Smart Contract

An Ethereum Smart contract which records transactions and provides useful data for payment channel signatures.
The iframe and Main Website both use web3.js to interface with the smart contract

## Ops

There is no datastore beyond the blockchain.
App is deployed using docker and kubernetes.

----
## Getting started (dev)

Clone this repo locally. Make sure you have [docker installed](https://docs.docker.com/engine/installation/).

At this point, we use docker to develop since the app needs multiple "services". Shortly we will be able to run the whole applications (all its services) with a single command. Dev changes should also be taken into account "in real time" to avoid rebuilding.

For now, we have 2 our of 3 services running in Docker.

1. Running the button
  1.1 `cd button`
  1.2 `docker build ./ -t button`
  1.3 `docker run -it -p 3001:80 -v `pwd`:/usr/share/nginx/html button`

You should have the button running. Check in your browser by going to `http://localhost:3001/button.js`. The JS code for the button should be there.

2. Running the Unlock app
  2.1 `cd unlock`
  2.2 `docker build ./ --build-arg app_env=production -t unlock`
  2.3 `docker run -i -t -p 3000:3000 unlock`

The app should be running (it is very very minimal at this point tho). Check by going to `http://localhost:3000/` and you should see a modal.

I have added a "fake" creator page in `tests/integration/creator/creator.html` which can show you how the whole thing work when loaded from an HTML doc.

1. `cd tests/integration/creator/`
2. run a local server in there. I use [static-server](https://www.npmjs.com/package/static-server): `static-server`
3. Open http://localhost:9080/creator.html

Later, we will connect to an ethereum node too!
