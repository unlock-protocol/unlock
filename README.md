# Repositoty for the code to run Unlock

4 steps to POC

1. Working JS snippet which can be embedded on a webpage and will erase the content of the page of the current user is not allowed to view it.
2. Accept "slow" blockchain transaction to unlock content
3. Fast payment channel to unlock content
4. Accept CC payment


## Components

### JS snippet (Button)

The JS snippet can be embedded on any webpage and provides a small set of API which locks and unlocks content on that page, based on data loaded from an invisible iframe. Communication with the iframe is achieved thru https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage JS API

### Iframe

This is the "sandboxed" web application which "follows" the user accross the web. It is a modern PWA which stores as much as possible locally in order to avoid network latency and delays. It stores cookies which identify the user.

It behaves very similary to metamask.

### Main Website

Under the same domain as the iframe, it shares the data and provides a useful UI that lets the user perform payments and view transasction history. This UI should also be used to "sync" data accross multiple user agents. Relies on WebRTC to achieve this.

### Smart Contract

An Ethereum Smart contract which records transactions and provides useful data for payment channel signatures.
The iframe and Main Website both use web3.js to interface with the smart contract


## Ops

There is no datastore beyond the blockchain.
App is deployed using docker and kubernetes.