# Runs all the tests!

# Note: explicit || exit 1 is important (but brittle) https://github.com/unlock-protocol/unlock/issues/194
echo "--------------------------- TESTING SMART CONTRACTS -----------------------------------------"
# Solidity tests
cd /home/unlock/smart-contracts
# missing npm module from the truffle/ci image
npm install

truffle test --network test || exit 1
npm run lint || exit 1

echo "--------------------------- TESTING REACT APP -----------------------------------------------"
# React tests && linting
cd /home/unlock/unlock-app
npm install
CI=1 npm test || exit 1
npm run lint || exit 1


echo "--------------------------- TESTING INTEGRATION ----------------------------------------------"
# Integration tests
# Must be run last because they require smart contracts to have been deployed
# We also must build the application before running the integration tests
cd /home/unlock/unlock-app
npm run build
cd /home/unlock/tests
npm install
CI=1 npm test || exit 1


echo "--------------------------- DONE TESTING ----------------------------------------------------"
