# Runs all the tests!

# Note: explicit || exit 1 is important (but brittle) https://github.com/unlock-protocol/unlock/issues/194

# Solidity tests
cd /home/unlock/smart-contracts
# missing npm module from the truffle/ci image
npm install

truffle test --network test || exit 1
npm run lint || exit 1

# React tests && linting
cd /home/unlock/unlock-app
npm install
CI=1 npm test || exit 1
npm run lint || exit 1
# Check that the styling guide is respected
npm run reformat
cd .. # Back to root
CHANGED=$(git diff-index --name-only HEAD -- | grep -v package-lock.json | grep -v npm-shrinkwrap.json)
if [ -z "$CHANGED" ]; then
  echo "Format discrepancies. Please run \`npm run reformat\` before your commit."
  echo "Files with wrong format:"
  git diff $CHANGED
  exit 1
fi

