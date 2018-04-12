# Unlock Protocol

This is the code repository for Unlock's full code.

## Smart Contract

Includes the code for smart contracts: Lock and Unlock.

## unlock-protocol.com

A static site for unlock-protocol.com. Will eventually be deprecated un favor of code deployed from
unlock-app.

## unlock-app

The code for the React app which interfaces with the deployed smart contracts.

# Running tests/ci

We deploy with docker/docker-compose:

```
docker-compose -f docker/docker-compose.ci.yml build
docker-compose -f docker/docker-compose.ci.yml -p ci up  --abort-on-container-exit
```
