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

It is possible to run these tests locally with docker.
The script `/scripts/integration-tests.sh` at the root of the mono-repo has all the required steps.
It will build and run all the required images and then will run the tests inside of this repo.
Note that images expose the ports both inside and outside of the docker compose cluster, which means that you should be able to run tests outside of docker as well with `yarn test` inside of `/tests`.

There are a few interesting and useful debugging options [on this page](https://github.com/GoogleChrome/puppeteer#debugging-tips) including the ability to 'slow down' execution via `slowMo`...

## TODO

We are currently missing integration coverage for a few pieces of the checkout.

- User Accounts (will require infrastructure setup, approving lock, figuring out how to deal with Stripe API call, etc.)

  - User can create account
  - User can log in to existing account
  - User can save a credit card
  - User can purchase a key with a credit card

- Metadata collection
  - Ensure that paywall saves metadata when specified in config
