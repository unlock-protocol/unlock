# Ethereum Node

This will be the working directory for the ethereum container which runs an ethereum node/wallet.

In dev/test, we connect to the "fake" network via testrpc (Ganache cli): https://github.com/trufflesuite/ganache-cli

In dev, we do not want to deal with an actual Ethereum network and for this we can use testrpc (now ganache) like this:

`docker run -p 8545:8545 trufflesuite/ganache-cli:latest -10`

In staging/ci, we probably want to connect to the Ethereum test network (rinkeby)

`docker run -v `pwd`:/root -p 8545:8545 -p 30303:30303 ethereum/client-go --testnet --fast --cache=512`

In production, we will run the following:

`docker run -v `pwd`:/root -p 8545:8545 -p 30303:30303 ethereum/client-go --fast --cache=512`

