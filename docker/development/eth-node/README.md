# Hardhat docker node

Creates a standalone hardhat node,intended for development purposes


## Start the container

```
# build container
docker build -t eth-node .

# launch ETH node 
docker run --rm -it eth-node node
```

## Prepare for Unlock dev

```
docker run --rm -it eth-node yarn hardhat node
```

