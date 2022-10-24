# Hardhat docker node

Creates a standalone hardhat node,intended for development purposes

## Prepare for Unlock dev

### Start an ETH node

```
yarn start
```

### Deploy contracts and sample locks

```
yarn provision --network localhost
```

## Dockerize

```
# build container
docker build --rm -t eth-node .

# launch ETH node
docker run -it --rm -p 8545:8545 eth-node
```

Your node will be accessible locally using `hardhat run <xxx> --network localhost`
