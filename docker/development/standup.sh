#!/bin/bash

(node /standup/deploy-unlock.js &)
(node /app/ganache-core.docker.cli.js -i 1984 --mnemonic 'hello unlock save the web' -b 3 )

