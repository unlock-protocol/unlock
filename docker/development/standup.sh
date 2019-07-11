#!/bin/bash

BLOCKTIME=${1:-3}

echo "using block time of ${BLOCKTIME} seconds"

(node /standup/deploy-unlock.js &)
(node /app/ganache-core.docker.cli.js -i 1984 --mnemonic 'hello unlock save the web' -b $BLOCKTIME )

