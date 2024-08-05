## Starting Service for Local Development

In effort to aid the ease of development, we have provided a Docker compose file that will run all of the required services needed allowing developers to focus on applications based on the Unlock contracts and associated infrastructure.

The following services are run as part of the compose setup:

- eth-node (hardhat)
- graph protocol node
- ipfs
- postgres
- locksmith

The services running under the configuration are well configured and ready to develop against.

### Starting the services

Running the following will start the services
`docker compose up --build`
