#!/usr/bin/env bash

# Fail if anything fails!
set -e

# This script starts ganache along with the extra params passed to it
# Optionally, if an ETHEREUM_ACCOUNT env variable is set, the script
# will transfer some of the eth of the first unlocked account on the ganache
# node to it.

NETWORK_ID=1984
MNEMONIC="hello unlock save the web"
EXTRA_PARAMS=$@
PORT=8545
HOST=localhost
UNLOCK_ENV=dev # defaults to dev
FROM="0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2" # First unlocked account on node
AMOUNT=10000000000000000000 # 10 Eth (by default  unlocked account on the node have 100 Eth)
DOT_ENV_FILE=".env.$UNLOCK_ENV.local"

echo "> ganache-cli -i $NETWORK_ID -p $PORT -h $HOST --mnemonic $MNEMONIC $EXTRA_PARAMS"
ganache-cli -i $NETWORK_ID -p $PORT -h $HOST --mnemonic "$MNEMONIC" $EXTRA_PARAMS &


if [ -f $DOT_ENV_FILE ]
then
  source $DOT_ENV_FILE
  if [ -n "$ETHEREUM_ADDRESS" ]
  then
    echo "> Sending $AMOUNT to $ETHEREUM_ADDRESS from $FROM"
    sleep 5 # We need to wait 5 seconds for the ganache node to be ready... not great but
    # should work for now
    POST_PARAMS="{\"jsonrpc\":\"2.0\",\"method\":\"eth_sendTransaction\",\"params\":[{\"from\":\"$FROM\",\"to\":\"$ETHEREUM_ADDRESS\",\"value\":\"$AMOUNT\"}],\"id\":1}"
    curl -X POST --data "$POST_PARAMS" http://$HOST:$PORT/
  fi
fi