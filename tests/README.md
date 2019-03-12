# Integration tests

This is run to test integration tests which test Unlock as a whole.
Other tests (unit tests for smart contracts or for react app) belong in their respective folders.

This is useful to ensure that all blocks work "together" if they already work in isolation.
We do not expect developers to necessarily run these tests for nost feature work but they will be
run on every pull request as part of the CI/CD process.

We use Puppeteer and jest.

## Writing tests

We should test each "core" feature of the application. The approach is to write files in `/test`
which perform these tests.

## CI

In CI, running these tests requires 3 docker images:

- One with ganache, the local development ethereum node
- One with the whole next.js application (connected to the ganache node)
- One which actually runs puppeteer and executes the test suite.

## Running locally

It is possible to run the tests locally, without docker running. Additionally, running the test
locally allows for a little more flexibility to debug. For example, even if the tests are running in
a headless way by default, they can be run in an actual web browser which lets the developer see
what is being rendered on screen.

- start a local ganache node (at the root): `npm run start-ganache -- -b 1` (the -b 1 means that the node will mine blocks every second, even if no transaction has been added)
- deploy the smart contracts (in `/unlock-app`): `npm run deploy-unlock-contract`
- run the dashboard application (in `/unlock-app`): `npm run start` (you may need to build the application first: `npm run build`)
- run the paywall application (in `/paywall`): `npm run start` (you may need to build the application first: `npm run build`)
- execute the tests (in `/tests`): `npm run test`

There are a few interesting and useful debugging options [on this page](https://github.com/GoogleChrome/puppeteer#debugging-tips) including
the ability to 'slow down' execution via `slowMo`...
