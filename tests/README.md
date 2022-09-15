# Integration tests

This folder contains tests to make sure that the different parts of the Unlock Protocol plays nicely together (i.e. contracts, subgraph, server, ui, etc...).

### Run the entire test suite

The easiest way to run the tests is to use the command (from the root of the repo)

```
sh ./scripts/integration-tests.sh
```

### Development

For development, you will need to first run the docker stack

```
sh ./bin/tests.sh
```
