#! /bin/sh

# Initialize error flag
error=0

# Function to run check and track status
run_check() {
  echo "Running $1..."
  $1
  if [ $? -ne 0 ]; then
    echo "❌ $1 failed"
    error=1
  else
    echo "✅ $1 passed"
  fi
}

# Run all checks
run_check "yarn workspace @unlock-protocol/networks check:keys"
run_check "yarn workspace @unlock-protocol/networks check:tokens"
run_check "yarn workspace @unlock-protocol/networks check:hooks"
run_check "yarn workspace @unlock-protocol/networks check:verify"

run_check "yarn workspace @unlock-protocol/subgraph check"

run_check "yarn workspace @unlock-protocol/governance check"
run_check "yarn workspace @unlock-protocol/governance check:multisig"
run_check "yarn workspace @unlock-protocol/governance check:cross-chain"

# Exit with error code if any check failed
exit $error
      