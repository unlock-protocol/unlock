# Integration tests

This is run to test integration tests which test Unlock as a whole.
Other tests (unit tests for smart contracts or for react app) belong in their respective folders.

This is useful to ensure that all blocks work "together" if they already work in isolation.
We do not expect developers to necessarily run these tests for nost feature work but they will be
run on every pull request as part of the CI/CD process.

We use Puppeteer.
