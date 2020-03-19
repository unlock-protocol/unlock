#!/bin/bash

BLOCKTIME=${BLOCKTIME:-3}

echo "using block time of ${BLOCKTIME} seconds"

(node /app/ganache-core.docker.cli.js -i 1984 --mnemonic 'hello unlock save the web' -b $BLOCKTIME )

